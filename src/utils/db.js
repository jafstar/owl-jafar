import { SearchHistoryService } from "../storage/service/_service_searchhistory";

export const addHistory = (data) => {
  const service = new SearchHistoryService();

  const tmpData = {
    id: data.id,
    stock: data.stock,
  };

  service.addData(tmpData).then((dbResp) => {
    // console.log("DB Add: ", dbResp);
  });
};

export const getHistory = () => {
  const service = new SearchHistoryService();

  return service.getData().then((dbResp) => {
    // console.log("DB Get: ", dbResp);
    return dbResp;
  });
};
