Page({
  data: {
    theme: 'light',
    target: 0,
    nums: [],
    rows: [],
    height: 0,
    result: '',
    audio_status: 'fill'
  },

  onLoad() {
    this.initNums();
    this.setData({
      theme: wx.getSystemInfoSync().theme || 'light'
    })
    if (wx.onThemeChange) {
      wx.onThemeChange(({theme}) => {
        this.setData({theme})
      })
    }

    // 调整长宽一致
    var query = wx.createSelectorQuery();
    var that = this;
    query.select("#border").boundingClientRect(function(res) {
      console.log("res", res);
      console.log("width", res.width);
      that.setData({
        height: Math.floor(res.width / 5.0)
      })
    }).exec();

    // setTimeout(()=> {
    //   that.setData({
    //     isHide: true
    //   });
    //   console.log('isHide', that.data.isHide);
    // }, 1000)
  },
  onShareAppMessage() {
    return {
      title: 'addition',
      path: 'packageComponent/pages/calculate/addition/addition'
    }
  },

  hintEnd() {
    if (this.data.audio_status == 'fill')
      wx.createAudioContext('hint-number-audio').play();
  },
  changeAudio() {
    var audio_status = (this.data.audio_status == 'fill') ? 'static' : 'fill';
    this.setData({
      audio_status: audio_status
    })
  },

  initNums() {
    if (this.data.audio_status == 'fill')
      wx.createAudioContext('hint-audio').play();
    var target_cnt = Math.floor(Math.random() * 2 + 2);
    var noise_cnt = Math.floor(Math.random() * 2 + 2);
    this.randTarget(target_cnt);
    this.randNoise(noise_cnt);

    // 打乱顺序
    var nums = this.data.nums;
    nums.sort(function() {
      return .5 - Math.random();
    });
    console.log('sort', nums);

    // 获取排列
    var rows = new Array();
    var row_num = 3;
    for (var i = 0; i < nums.length / row_num; i++) {
      var cols = new Array();
      for (var j = 0; j < row_num && i * 3 + j < nums.length; j++) {
        cols.push({id: i * 3 + j, value: nums[i * 3 + j], isHide: false});
      }
      rows.push(cols);
    }
    console.log('rows', rows);
    this.setData({
      nums: nums,
      rows: rows
    })
  },

  // 获取组合目标数
  randTarget(cnt) {
    var sum = 0;
    var min = 2, max = 8, max_target = 15;
    for (var i = 0; i < cnt; i++) {
      if (max + sum > max_target - sum - 2 * (cnt - i - 1)) {
        max = max_target - sum - 2 * (cnt - i - 1);
      }
      var num = Math.floor(Math.random() * (max - min + 1) + min);
      this.data.nums.push(num);
      sum += num;
    }
    this.setData({
      target: sum
    })
    console.log('randTarget', this.data.nums, this.data.target);
  },

  // 获取干扰数
  randNoise(cnt) {
    var min = 2, max = 8;
    for (var i = 0; i < cnt; i++) {
      var num = Math.floor(Math.random() * (max - min + 1) + min);
      this.data.nums.push(num);
    }
    console.log('randNoise', this.data.nums);
  },

  // 点击数字事件
  clickNum(e) {
    if (this.data.result != '') return;

    var id = e.currentTarget.dataset.id;
    var value = e.currentTarget.dataset.value;
    var nums = this.data.nums;
    nums.splice(nums.indexOf(value), 1);
    console.log("clickNum", id, value, nums);

    // 渐出动画效果
    var row_num = 3;
    var i = Math.floor(id / row_num);
    var j = id - row_num * i;
    this.setData({
      ['rows[' + i + '][' + j + '].isHide']: true,
      nums: nums
    });

    // 检查是否正确

    console.log('isCorrect', this.isCorrect());
    console.log('findTarget', this.findTarget(0, 0));
    if (this.isCorrect()) {
      this.setData({
        result: 'correct'
      })
      if (this.data.audio_status == 'fill')
        wx.createAudioContext('result-audio').play();
    } else if (!this.findTarget(0, 0)) {
      this.setData({
        result: 'wrong'
      })
      
      if (this.data.audio_status == 'fill')
        wx.createAudioContext('result-audio').play();
    }
  },

  isCorrect() {
    var sum = 0;
    this.data.nums.forEach((num) => {
      sum += parseInt(num);
    });
    console.log('isCorrect', sum, this.data.nums, this.data.target);
    if (sum == this.data.target) return true;
    return false;
  },

  // 任意组合子集之和为目标，即还可以得到正确答案
  findTarget(i, sum) {
    var num = this.data.nums[i];
    var target = this.data.target;
    if (sum + num == target) return true;
    if (i >= this.data.nums.length - 1) return false;
    if (sum + num < target) {
      if (this.findTarget(i + 1, sum + num)) return true;
    }
    if (this.findTarget(i + 1, sum)) return true;
    return false;
  },

  nextQuestion() {
    this.setData({
      target: 0,
      nums: [],
      rows: [],
      result: false
    })
    this.initNums();
  }
})
