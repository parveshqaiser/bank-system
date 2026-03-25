
export const checkInputValidation = (...fields) => {

    for(let item of fields){
        if(!item?.toString().trim()){
            return  "All Input Fields Required"
        }
    }
    return  null;
};