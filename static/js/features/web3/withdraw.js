import { singleTokenStakingABI, contracts } from "../configure";
import { enqueueSnackbar } from "../common/redux/actions";

export const withdraw = async ({
  web3,
  address,
  depositId,
  poolData,
  dispatch,
}) => {
  const contract = new web3.eth.Contract(
    singleTokenStakingABI,
    poolData.poolAddress
  );
  const data = await _withdraw({
    web3,
    contract,
    address,
    depositId,
    dispatch,
  });
  return data;
};

const _withdraw = ({ web3, contract, address, depositId, dispatch }) => {
  return new Promise((resolve, reject) => {
    contract.methods
      .withdraw(depositId, address)
      .send({ from: address })
      .on("transactionHash", function (hash) {
        dispatch(
          enqueueSnackbar({
            message: hash,
            options: {
              key: new Date().getTime() + Math.random(),
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
