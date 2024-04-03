import { singleTokenStakingABI, contracts } from "../configure";
import { enqueueSnackbar } from "../common/redux/actions";

export const claimReward = async ({
  web3,
  address,
  contractAddress,
  rewardAddress,
  dispatch,
}) => {
  const contract = new web3.eth.Contract(
    singleTokenStakingABI,
    contractAddress
  );
  const data = await _claimReward({
    web3,
    contract,
    address,
    rewardAddress,
    dispatch,
  });
  return data;
};

const _claimReward = ({ web3, contract, address, rewardAddress, dispatch }) => {
  return new Promise((resolve, reject) => {
    contract.methods
      .claimRewards(rewardAddress, address)
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
