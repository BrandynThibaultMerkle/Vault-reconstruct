import { byDecimals } from "./bignumber";

let trimReg = /(^\s*)|(\s*$)/g;

export function isEmpty(key) {
  if (key === undefined || key === "" || key === null) {
    return true;
  }
  if (typeof key === "string") {
    key = key.replace(trimReg, "");
    return (
      key === "" ||
      key === null ||
      key === "null" ||
      key === undefined ||
      key === "undefined"
    );
  } else if (typeof key === "undefined") {
    return true;
  } else if (typeof key == "object") {
    for (let i in key) {
      return false;
    }
    return true;
  } else if (typeof key == "boolean") {
    return false;
  }
}

let inputReg = /[a-z]/i;
export function inputLimitPass(value, tokenDecimals) {
  let valueArr = value.split(".");
  return !(
    inputReg.test(value) ||
    (valueArr.length === 2 && valueArr[1].length > tokenDecimals)
  );
}

export function inputFinalVal(value, total, tokenDecimals) {
  let inputVal = Number(value.replaceAll(",", ""));
  return inputVal > total
    ? byDecimals(total, 0).toFormat(tokenDecimals)
    : value;
}

export const shouldHideFromHarvest = (vaultName) => {
  // FIXME: hidden until we implement an 'advanced' toggle
  // return HarvestBlacklistVaultIds.includes(vaultName);
  return true;
};

// const HarvestBlacklistVaultIds = [
//   'bifi-maxi',
//   'fortube-fil',
//   'fortube-atom',
//   'fortube-xtz',
//   'fortube-busd',
//   'fortube-link',
//   'fortube-dot',
//   'fortube-usdt',
//   'fortube-eth',
//   'fortube-btcb',
//   'fry-burger-v2',
// ];

export const converAprToApy = (apr) => {
  return Math.pow(1 + apr / 365, 365) - 1;
};

export const converAprStringToApyString = (aprString) => {
  const apr = parseFloat(aprString.replace("%", "")) / 100;
  return parseFloat(converAprToApy(apr) * 100).toFixed(2) + "%";
};

export const convertApyFloatToString = (apyFloat) => {
  return (apyFloat * 100).toFixed(2) + "%";
};

export const convertAprFloatToString = (aprFloat) => {
  return parseFloat(converAprToApy(aprFloat) * 100).toFixed(2) + "%";
};
