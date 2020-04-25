const storeToDb = (key, value) => {
  console.log(key, value);
};

const userInfoObject = {
  setInterestMen: 1,
  setInterestWomen: 2,
  setInterestBoth: 3,
  setGenderMale: 4,
  setGenderFemale: 5,
  setGenderTrans: 6,
  setVoice: 7,
};

const setUserInfo = (key) => {
  //TODO do smthing with the key -> store in DB preferences
  console.log(key);
};
exports.storeToDb = storeToDb;
exports.setUserInfo = setUserInfo;
