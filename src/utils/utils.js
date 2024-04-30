export const utils = {
    isEmpty: function (someVar) {
        if (someVar == "" || someVar == null || someVar == undefined || someVar == {}) {
            return true
        } else {
            return false
        }
    },
    isNotEmpty(someVar) {
        return !this.isEmpty(someVar)
    },
    isEmptyObject: function (obj) {
        return obj == null || Object.keys(obj).length === 0 && obj.constructor === Object
    },
    isSubstringOfOther(str1, str2) {
        str1 = str1.toLowerCase()
        str2 = str2.toLowerCase()

        return str1.substring(0, str2.length) == str2 || str2.substring(0, str1.length) == str1
    },
    cloneObj(obj) {
        return { ...obj };
    },
    cloneObjArray(objArray) {
        return objArray.map(obj => ({ ...obj }))
    },
    parseJson(str) {
        try {
            return JSON.parse(str)
        } catch (error) {
            return {}
        }
    }
}
