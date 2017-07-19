/* global */
import '../../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js';
//import 'babel-polyfill'

//import _ from 'lodash'
import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import { createStore } from 'redux'
import PropTypes from 'prop-types'
import { MyDb } from './MyDb';

// index.html ファイルをコピーする
require('file-loader?name=../../dist/[name].[ext]!../index.html');

// Database custom object

const myDb = new MyDb('MyDb');

//-----------------------------------
// Action creators (Actionを返す)
//-----------------------------------

const DB_CREATE = 'DB_CREATE';
const DB_REMOVE = 'DB_REMOVE';
const DB_ADD_DATA = 'DB_ADD_DATA';
const DB_GET_ALL = 'DB_GET_ALL';
const createDb = () => {
  return {
    type: DB_CREATE
  }
}
const removeDb = () => {
  return {
    type: DB_REMOVE
  }
}
const addData = (ssn, name, age, email) => {
  return {
    type: DB_ADD_DATA,
    ssn,
    name,
    age,
    email
  }
}
const getDataAll = () => {
  return {
    type: DB_GET_ALL
  }
}

//-----------------------------------
// Reducer
//-----------------------------------

// SessionStorageとLocalStorageの内容のハッシュ化した文字列をstateとする
const dataShow = (state = false, action) => {
  switch (action.type) {
    case DB_CREATE:
      myDb.createDb();
      return false;
    case DB_GET_ALL:
      myDb.getDataAll();
      return true;
    case DB_ADD_DATA:
      myDb.addData(action);
      console.log('DB_ADD_DATA: action: ', action);
      return true;
    case DB_REMOVE:
      myDb.removeDb();
      return false;
    default:
      return state;
  }
};

//-----------------------------------
// Component
//-----------------------------------

class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.ssnInput;
    this.nameInput;
    this.ageInput;
    this.emailInput;
  }

  render() {

    return (
      <div>
        <div className="panel panel-success">
          <div className="panel-heading"></div>
          <div className="panel-body">

            <section>
              <button type="button"
                onClick={this.props.clickToCreateDb}>オブジェクトストアを作成する</button>
            </section>

            <section>

              <label>ssn:</label>
              <input type="text"
                     ref={(input) => { this.ssnInput = input; }} />
              <label>name:</label>
              <input type="text"
                     ref={(input) => { this.nameInput = input; }} /><br/>
              <label>age:</label>
              <input type="text"
                     ref={(input) => { this.ageInput = input; }} />
              <label>email:</label>
              <input type="text"
                     ref={(input) => { this.emailInput = input; }} />

              <button type="button"
                onClick={() => {this.props.clickToAddData(
                                  this.ssnInput.value,
                                  this.nameInput.value,
                                  this.ageInput.value,
                                  this.emailInput.value )}}>データを保存する</button><br/>
            </section>

            <section>
              <button type="button"
                onClick={this.props.clickToRemoveDb}>オブジェクトストアを削除する</button><br/>
            </section>

            <section>
              <button type="button"
                onClick={this.props.clickToGetAll}>全てのデータを取得する</button><br/>
            </section>



          </div>
        </div>
      </div>
    );
  }
}

AppComponent.propTypes = {
  data: PropTypes.array,
  clickToCreateDb: PropTypes.func.isRequired,
  clickToAddData: PropTypes.func.isRequired,
  clickToRemoveDb: PropTypes.func.isRequired,
  clickToGetAll: PropTypes.func.isRequired
};

//-----------------------------------
// Container
//-----------------------------------

const AppContainer = (() => {

  const mapStateToProps = (state/*, ownProps*/) => {

    const data = [];
    if (state.dataShow) {
      // データを取得する
      // TODO: Promise にしたが、ここではどう書けば良い？
      myDb.getDataAll()
        .then()
      ;
      // 表示用にフォーマットなどを変換する

    }

    //console.log('data', data);

    return {
      data
    };
  }
  
  const mapDispatchToProps = (dispatch) => {
    return {
      clickToCreateDb: () => {
        dispatch(createDb());
      },
      clickToAddData: (ssn, name, age, email) => {
        dispatch(addData(ssn, name, age, email));
      },
      clickToRemoveDb: () => {
        dispatch(removeDb());
      },
      clickToGetAll: () => {
        dispatch(getDataAll());
      }
    }
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(AppComponent);

})();

//-----------------------------------
// Store
//-----------------------------------

const store = createStore(dataShow)

//-----------------------------------
// 画面に表示する
//-----------------------------------

render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
)




const dbName = "the_name";
// データベースを開く
const request = window.indexedDB.open(dbName, 4);

request.addEventListener('error', (/*event*/) => {
  //console.error(event);
  //console.error(`Database error:${event.target.errorCode}`);
});

request.addEventListener('success', (event) => {
  //console.log('success');
  
  const db = event.target.result;
  //console.log(db);

  const transaction = db.transaction(["customers"]);
  const objectStore = transaction.objectStore("customers");
  const request2 = objectStore.get("444-44-4444");

  request2.onerror = (/*event*/) => {
    //console.error(event);
  };
  request2.onsuccess = (/*evnet*/) => {
    const data = request2.result;
    //console.log(`Name for SSN 444-44-4444 is ${data.name} (age: ${data.age})`);

    // 値を更新する
    const objectStore2 = db.transaction(["customers"], "readwrite").objectStore("customers");

    data.age = 50;
    const requestUpdate = objectStore2.put(data);
    requestUpdate.onerror = (/*event*/) => {
      //console.log(event);
    };
    requestUpdate.onsuccess = (/*event*/) => {
      const request3 = objectStore2.get("444-44-4444");

      request3.onerror = (/*evnet*/) => {
        //console.log(event);
      };
      request3.onsuccess = (/*evnet*/) => {
        //const data = request2.result;
        //console.log(`Name for SSN 444-44-4444 is ${data.name} (age: ${data.age})`);
      };
    };
  }

});

request.addEventListener('upgradeneeded', (event) => {

  // 顧客データがどのようなものかを示します
  const customerData = [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
  ];


  //console.log('upgradeneeded');
  const db = event.target.result;
  if (!db.objectStoreNames.contains('customers')) {
    const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });

    objectStore.transaction.oncomplete = (/*event*/) => {
      const customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
      for (const i in customerData) {
        customerObjectStore.add(customerData[i]);
      }
    };
  }
});
