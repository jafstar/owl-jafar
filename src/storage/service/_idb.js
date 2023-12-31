import { DATA_TYPE, Connection } from "jsstore";

const getWorkerPath = () => {
  if (process.env.NODE_ENV === "development") {
    return require("file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.js");
  } else {
    return require("file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.min.js");
  }
};

// This will ensure that we are using only one instance.
// Otherwise due to multiple instance multiple worker will be created.
const workerPath = getWorkerPath().default;
export const idbCon = new Connection(new Worker(workerPath));
export const dbname = "OWL";

const getDatabase = () => {
  const tblSearchHistory = {
    name: "SearchHistory",
    columns: {
      id: {
        primaryKey: true,
        autoIncrement: true,
      },
      stock: {
        notNull: true,
        dataType: DATA_TYPE.String,
      },
    },
  };

  const dataBase = {
    name: dbname,
    tables: [tblSearchHistory],
  };

  return dataBase;
};

export const initJsStore = () => {
  try {
    const dataBase = getDatabase();
    idbCon.initDb(dataBase);
  } catch (ex) {
    console.error(ex);
  }
};
