import {
    idbCon
} from "./_idb";
export class BaseService {

    get connection() {
        return idbCon;
    }

}
