import { singleTokenStakingABI, contracts } from "../configure";
import { enqueueSnackbar } from "../common/redux/actions";
import axios from "axios";
import { apiUrlV2 } from "../configure";
export const deposit = async ({
  web3,
  address,
  poolData,
  amount,
  duration,
  dispatch,
}) => {
  // here duration is week, need to multiple 7*24*60*60

  let lockPeriod =
    duration * 30 * 24 * 60 * 60 > 86400 * 30
      ? duration * 30 * 24 * 60 * 60
      : 86400 * 30;

  const contract = new web3.eth.Contract(
    singleTokenStakingABI,
    poolData.poolAddress
  );
  const data = await _deposit({
    web3,
    contract,
    amount,
    duration: lockPeriod,
    address,
    dispatch,
    poolAddress: poolData.poolAddress,
  });
  return data;
};

const _deposit = ({
  web3,
  contract,
  amount,
  duration,
  address,
  poolAddress,
  dispatch,
}) => {
  return new Promise((resolve, reject) => {
    contract.methods
      .deposit(amount, duration, address)
      .send({ from: address })
      .on("transactionHash", function (hash) {
        let now = new Date().getTime();
        axios.post(apiUrlV2 + "/api/users/stake", {
          poolAddress,
          userAddress: address,
          startTime: now,
          endTime: now + duration,
          amount,
        });
        dispatch(
          enqueueSnackbar({
            message: hash,
            options: {
              key: now + Math.random(),
              variant: "success",
            },
            hash,
          })
        );
      })
      .on("receipt", function (receipt) {
        resolve();
      })
      .on("error", function (error) {
        reject(error);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
