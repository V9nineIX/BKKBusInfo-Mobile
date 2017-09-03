import Realm from 'realm';
import fs from 'react-native-fs';
import { Platform } from 'react-native';

const FILE_NAME = "bi.realm"

const getRealm = new Promise(function (resolve, reject) {

    //const FILE_NAME = "bi.realm"
     const FILE_NAME = "bi.realm"
     let realm =  "";
    
    if (Platform.OS === 'ios') {

        realm = new Realm({ path: fs.MainBundlePath+ '/' + FILE_NAME });
                resolve(realm);
                return;


        try {
        fs.stat(fs.DocumentDirectoryPath + '/' + FILE_NAME)
            .then(() => {
                realm = new Realm({ path: fs.DocumentDirectoryPath + '/' + FILE_NAME });
                resolve(realm);
            }).catch((err) => {

                fs.copyFile(fs.MainBundlePath + '/' + FILE_NAME, fs.DocumentDirectoryPath + '/' + FILE_NAME)
                    .then((response) => {
                        fs.stat(fs.DocumentDirectoryPath + '/' + FILE_NAME)
                            .then(() => {
                                realm = new Realm({ path: fs.DocumentDirectoryPath + '/' + FILE_NAME });
                                resolve(realm);
                            }).catch((err) => { console.log(err) });

                    }).catch((err) => console.log(err));
            });
        }catch(ex){

             realm = new Realm({ path: fs.MainBundlePath+ '/' + FILE_NAME });
                resolve(realm);


        }

    } else {
       
         fs.copyFileAssets(FILE_NAME,
                        fs.DocumentDirectoryPath + '/'+FILE_NAME)
                        .then(() => {
                          realm = new Realm({
                              path: fs.DocumentDirectoryPath + '/'+FILE_NAME
                          });
                          resolve(realm);
         });
        
//  fs.unlink(fs.DocumentDirectoryPath + '/'+FILE_NAME).then( (delStatus) => {

//         fs.exists(fs.DocumentDirectoryPath + '/'+FILE_NAME)
//             .then((status) => {
//                 if (!status) {
//                     fs.copyFileAssets(FILE_NAME,
//                         fs.DocumentDirectoryPath + '/'+FILE_NAME)
//                         .then(() => {
//                          //console.log("copy");
//                          // realm.path = fs.DocumentDirectoryPath + '/'+FILE_NAME;
//                           realm = new Realm({
//                               path: fs.DocumentDirectoryPath + '/'+FILE_NAME
//                           });
//                           resolve(realm);
//                         });
//                 }
//                 else{   
//                    // console.log("file already");
//                      //realm.path = fs.DocumentDirectoryPath + '/'+FILE_NAME;
//                       realm = new Realm({
//                               path: fs.DocumentDirectoryPath + '/'+FILE_NAME
//                           });
//                     resolve(realm);
//                 }
//             });
//      });

    } // end else;

});



const checkSchema = function (path) {
     let realm = new realm({
         path:path
     });

     try{
       realm.objects("Bus")
     }catch(ex){
         
     }

     


}






export { getRealm };