const { db } = require('../models/firebase');

const storeData = async (collectionName, documentId, data) => {
  const documentRef = db.collection(collectionName).doc(documentId);
  await documentRef.set(data);
  return documentId;
};

const getData = async (collectionName) => {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  const data = [];

  snapshot.forEach((doc) => {
    data.push(doc.data());
  });

  return data;
};

module.exports = { storeData, getData };