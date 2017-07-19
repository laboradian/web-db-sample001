class MyDb {
  constructor(dbName) {
    this.dbName = dbName;
    this.db;
    this.request = window.indexedDB.open(this.dbName, 4);
    console.log('opened!');

    this.request.addEventListener('error', (event) => {
      // open()の第二引数のバージョンが、現在よりも前なだけでエラーになる。
      console.error('error');
      console.error(event.target);
      //console.error(`Database error:${event.target.errorCode}`);
    });
    
    this.request.addEventListener('success', ((event) => {
      this.db = event.target.result;
      console.log('success');
      console.log(this.db);
    }).bind(this));
    
    this.request.addEventListener('upgradeneeded', ((event) => {
      console.log('upgradeneeded');

      // いくつかのデータは自動で追加しておく
      // 顧客データがどのようなものかを示します
      const customerData = [
        { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@example.com" },
        { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@example.com" }
      ];

      this.db = event.target.result;
      if (!this.db.objectStoreNames.contains('customers')) {
        const objectStore = this.db.createObjectStore("customers", { keyPath: "ssn" });

        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("email", "email", { unique: true });

        objectStore.transaction.oncomplete = (/*event*/) => {
          const customerObjectStore = this.db.transaction("customers", "readwrite").objectStore("customers");
          for (const i in customerData) {
            customerObjectStore.add(customerData[i]);
          }
          console.log('oncomplete end');
        };
      }
    }).bind(this));
  }

  createDb() {
    console.log('MyDb: createDb() called');
    console.log('createDb() do nothing!');
  }

  removeDb() {
    console.log('MyDb: removeDb() called');
    console.log('this.db', this.db);

    const DBDeleteRequest = window.indexedDB.deleteDatabase(this.dbName);
    console.log(DBDeleteRequest);
    DBDeleteRequest.onerror = (/*event*/) => {
      console.log("Error deleting database.");
    };
    DBDeleteRequest.onsuccess = (event) => {
      console.log("Database deleted successfully");
      console.log(event.result); // should be undefined
    };

    //this.db.deleteObjectStore(this.dbName);

    //const req = window.indexedDB.deleteDatabase(this.dbName);
    //req.onsuccess = function () {
    //    console.log("Deleted database successfully");
    //};
    //req.onerror = function () {
    //    console.log("Couldn't delete database");
    //};
    //req.onblocked = function () {
    //    console.log("Couldn't delete database due to the operation being blocked");
    //};
  }

  addData(obj) {
    console.log('MyDb: addData() called');
    console.log('obj', obj);

    const customerObjectStore = this.db.transaction("customers", "readwrite")
      .objectStore("customers");
    customerObjectStore.add(obj);
  }

  getDataAll() {
    console.log('MyDb: getDataAll() called');

    return new Promise((resolve/*, reject*/) => {
      const os = this.db.transaction("customers", "readwrite", 1000).objectStore("customers");
      const req = os.openCursor();
      req.addEventListener('success', ((event) => {
        const cursor = event.target.result;
        if (!cursor) {
          // データがなくなるとここにきて終わる。
          resolve();
          return;
        }
        const val = cursor.value;
        console.log('val', val);
        cursor.continue();
      }).bind(this));
    });
  }
}

export { MyDb };
