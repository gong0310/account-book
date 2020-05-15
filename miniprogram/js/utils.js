class Utils {

  //千分位
  thousandthPlace(num) {
    let nums = num.toString().split('.');
    //整数位
    let intNum = nums[0];
    let numArr = [];
    for (let i = intNum.length - 1; i >= 0; i -= 3) {
      let index = i - 2 < 0 ? 0 : i - 2;
      numArr.unshift(intNum.slice(index, i + 1));
    }
    numArr = numArr.join(',');
    //小数位
    var decimalNum = nums[1];

    if (decimalNum !== undefined) {
      numArr += '.' + decimalNum
    }

    return numArr;

  }

}


//导出实例
export const utils = new Utils();