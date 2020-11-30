const href = window.location.href
const offsetHeight = document.querySelector('#container').offsetHeight
// 创建并注入标签
const $nav = document.querySelector('#nav')
const $container = document.querySelector('#container')
const $mask = document.createElement('div')
const $favoriteBtn = document.createElement('div')
const $unFavoriteBtn = document.createElement('div')
const $exTips = document.createElement('div')
const $loginOut = document.createElement('div')
const $a1 = document.createElement('a')
const $a2 = document.createElement('a')
$a1.setAttribute('class', 'nav_button ex_button')
$a1.setAttribute('id', 'exFavorite')
$a2.setAttribute('class', 'nav_button ex_button')
$a2.setAttribute('id', 'exHistory')
$favoriteBtn.setAttribute('class', 'favorite_btn')
$unFavoriteBtn.setAttribute('class', 'favorite_btn favorited')
$mask.setAttribute('class', 'ex_mask')
$mask.setAttribute('style', `min-height:${offsetHeight}px`)
$exTips.setAttribute('class', 'exTips')
$loginOut.setAttribute('class', 'loginOut')
$a1.innerText = '我的追番'
$a2.innerText = '历史'
$favoriteBtn.innerText = '追番'
$unFavoriteBtn.innerText = '已追番'
$nav.appendChild($a1)
$nav.appendChild($a2)
$container.appendChild($mask)
$mask.appendChild($exTips)

// 初始化状态
chrome.storage.sync.get({ user: null, token: null }, function(items) {
  // 创建登录注册模块
  createLoginContent()
  createRegisterContent()
  if (!items.token) {
    // 去注册
    const $loginArea = document.querySelector('#loginArea')
    const $registerArea = document.querySelector('#registerArea')
    const $toRegister = document.querySelector('#toRegister')
    $toRegister.addEventListener('click', function(ev) {
      $loginArea.style.display = 'none'
      $registerArea.style.display = 'block'
    })

    // 去登录
    const $toLogin = document.querySelector('#toLogin')
    $toLogin.addEventListener('click', function(ev) {
      $loginArea.style.display = 'block'
      $registerArea.style.display = 'none'
    })
  } else {
    $loginOut.innerText = `${items.user.data.username} | 退出`
    $mask.appendChild($loginOut)
  }
})

// 退出账号
$loginOut.addEventListener('click', function(ev) {
  chrome.storage.sync.clear(function() {
    window.location.href='/'
  })
})

// 导航处理
const $navs = $nav.querySelectorAll('.nav_button')
for (let i = 0; i < $navs.length; i++) {
  $navs[i].addEventListener('click', function(ev) {
    if ($navs[i].getAttribute('class').indexOf('ex_button') === -1) {
      $mask.style.display = 'none'
      setCurent()
    }
  })
}

// 追番
const hrefIndex = href.indexOf('detail')
if (hrefIndex > -1) {
  const fanid = href.substr(hrefIndex + 7)
  const $blockcontent = document.querySelector('.div_right').querySelector('.blockcontent')
  $favoriteBtn.setAttribute('data-fanid', fanid)
  $unFavoriteBtn.setAttribute('data-fanid', fanid)

  // 初始化状态
  initFn(fanid, $blockcontent)
}

// 我的追番
$a1.addEventListener('click', function(ev) {
  const $loginArea = document.querySelector('#loginArea')
  $mask.style.display = 'block'
  setCurent($a1)

  // 获取我的追番列表
  // 向后台通信
  chrome.storage.sync.get({ user: null, token: null }, function(items) {
    if (items.token) {
      // 向后台通信
      chrome.runtime.sendMessage({
        type: 'myFavorite',
        payload: { userId: items.user.data.id, token: items.token }
      }, function(response) {
        tokenFailed(response)
        // 移除列表
        $el1 = document.querySelector('.favorite_content')
        $el2 = document.querySelector('.history_content')
        if ($el1) $el1.remove()
        if ($el2) $el2.remove()
        // 生成列表
        createFavoriteContent(response.data)
      })
    } else {
      $loginArea.style.display = 'block'
    }
  })
})

// 历史
$a2.addEventListener('click', function(ev) {
  const $loginArea = document.querySelector('#loginArea')
  $mask.style.display = 'block'
  setCurent($a2)

  // 向后台通信
  chrome.storage.sync.get({ user: null, token: null }, function(items) {
    if (items.token) {
      // 向后台通信
      chrome.runtime.sendMessage({
        type: 'myHistory',
        payload: { userId: items.user.data.id, token: items.token }
      }, function(response) {
        tokenFailed(response)
        // 移除列表
        $el1 = document.querySelector('.history_content')
        $el2 = document.querySelector('.favorite_content')
        if ($el1) $el1.remove()
        if ($el2) $el2.remove()
        createHistoryContent(response.data)
      })
    } else {
      $loginArea.style.display = 'block'
    }
  })

})

// 初始化状态
function initFn(fanid, $el) {
  chrome.storage.sync.get({ user: null, token: null }, function(items) {
    if (items.token) {
      // 向后台通信
      chrome.runtime.sendMessage({
        type: 'checkFavorite',
        payload: { fanId: fanid, userId: items.user.data.id, token: items.token }
      }, function(response) {
        // 如果已经追番则显示已追番按钮
        if (response.data.result) {
          $el.appendChild($unFavoriteBtn)
        } else {
          $el.appendChild($favoriteBtn)
        }
      })
    }
  })

  // 追番事件
  $favoriteBtn.addEventListener('click', function() {
    chrome.storage.sync.get({ user: null, token: null }, function(items) {
      if (items.token) {
        // 向后台通信
        chrome.runtime.sendMessage({
          type: 'favorite',
          payload: { fanId: fanid, userId: items.user.data.id, token: items.token, base: getBaseInfo() }
        }, function(response) {
          $favoriteBtn.style.display = 'none'
          // 如果已经追番则显示已追番按钮
          if (response.data.result) {
            $el.appendChild($unFavoriteBtn)
            $unFavoriteBtn.style.display = 'block'
          }
        })
      }
    })
  })

  // 取消追番
  $unFavoriteBtn.addEventListener('click', function() {
    chrome.storage.sync.get({ user: null, token: null }, function(items) {
      if (items.token) {
        // 向后台通信
        chrome.runtime.sendMessage({
          type: 'cancleFavorite',
          payload: { fanId: fanid, userId: items.user.data.id, token: items.token, base: getBaseInfo() }
        }, function(response) {
          $unFavoriteBtn.style.display = 'none'
          // 如果已经追番则显示已追番按钮
          if (response.data.result) {
            $el.appendChild($favoriteBtn)
            $favoriteBtn.style.display = 'block'
          }
        })
      }
    })
  })
}

// 设置当前导航高亮
function setCurent(el) {
  const $navs = $nav.getElementsByClassName('nav_button')
  if (el) {
    for (let i = 0; i < $navs.length; i++) {
      $navs[i].setAttribute('class', 'nav_button')
    }
    el.setAttribute('class', 'nav_button ex_button nav_button_current')
  } else {
    for (let i = 0; i < $navs.length; i++) {
      $navs[i].setAttribute('class', 'nav_button')
    }
  }
}

// 我的追番区域
function createFavoriteContent(list) {
  let $html = ''
  const $favoriteContent = document.createElement('div')
  $favoriteContent.setAttribute('class', 'favorite_content')
  if (list.length) {
    for (let i = 0; i < list.length; i++) {
      const data = list[i].BangumiData
      $html += `<div class="item">
        <div class="thumb"><a href="https://www.agefans.net/detail/${data.fanId}"><img src="${data.cover}" /></a></div>
        <div class="info">
          <div class="title"><a href="https://www.agefans.net/detail/${data.fanId}">${data.name}</a></div>
          <div class="des">${data.description}</div>
          <div class="type">${data.region} | ${data.state}</div>
          <div class="state">
            ${ list[i].lastTime 
              ? 
              `看到 <a href="${list[i].lastUrl}&lastTime=${list[i].lastTime}">
                ${list[i].lastTime.indexOf('00') === 0 ? list[i].lastTime.substring(3) : list[i].lastTime} ${list[i].lastPos ? list[i].lastPos : ''}
              </a>`
              :
              `<a href="${list[i].lastUrl}">
                ${list[i].lastTime ? list[i].lastTime : ''} ${list[i].lastPos ? list[i].lastPos : ''}
              </a>`
            }
            ${list[i].lastTime && data.other ? '| ' : ''}${data.other ? data.other : ''}
          </div>
        </div>
      </div>`
    }
  } else {
    $html += '<div class="empty">这里空空如也，快去追番吧！</div>'
  }

  $favoriteContent.innerHTML = $html
  $mask.appendChild($favoriteContent)
}

// 我的历史区域
function createHistoryContent(list) {
  let $html = ''
  const $favoriteContent = document.createElement('div')
  $favoriteContent.setAttribute('class', 'history_content')
  if (list.length) {
    for (let i = 0; i < list.length; i++) {
      $html += `<div class="item">
        <div class="thumb"><a href="https://www.agefans.net/detail/${list[i].fanId}"><img src="${list[i].cover}" /></a></div>
        <div class="info">
          <div class="title"><a href="https://www.agefans.net/detail/${list[i].fanId}">${list[i].name}</a></div>
          <div class="state">
            看到
            <a href="${list[i].lastUrl}&lastTime=${list[i].lastTime}">
              ${list[i].lastTime.indexOf('00') === 0 ? list[i].lastTime.substring(3) : list[i].lastTime} 
              ${list[i].lastPos ? list[i].lastPos : ''}
            </a>
            | ${list[i].other}
          </div>
          <div class="state" style="margin-top: 10px">${dateFormat("YYYY-mm-dd HH:MM", new Date(list[i].updatedAt))}</div>
        </div>
      </div>`
    }
  } else {
    $html += '<div class="empty">这里空空如也，快去看番吧！</div>'
  }

  $favoriteContent.innerHTML = $html
  $mask.appendChild($favoriteContent)
}

// 登录区域
function createLoginContent() {
  const $loginContent = document.createElement('div')
  const $html = `<div class="baseblock baseForm" id="loginArea" style="display: none;">
    <div class="blocktitle">登陆——扩展程序</div>
    <div class="blockcontent">
      <form method="post" class="account_form">
        <p>
          <label for="ex_username">用户名:</label>
          <input type="text" name="username" autofocus maxlength="254" required id="ex_username">
        </p>
        <p>
          <label for="ex_password">密码:</label>
          <input type="password" name="password" required id="ex_password">
        </p>
        <button class="nbutton2" id="loginBtn" type="button" value="Submit">登陆</button>
      </form>
      <p>
        <a href="javscript:;" id="toRegister">新用户？请注册</a>
      </p>
    </div>
  </div>`

  $loginContent.setAttribute('class', 'login_content')
  $loginContent.innerHTML = $html
  $mask.appendChild($loginContent)
  
  // 绑定登录事件
  $loginBtn = document.querySelector('#loginBtn')
  $loginBtn.addEventListener('click', function() {
    const data = {
      username: document.querySelector('#ex_username').value,
      password: document.querySelector('#ex_password').value,
    }
    // 向后台通信
    chrome.runtime.sendMessage({type: 'login', payload: data }, function(response) {
      if (response.data.success) {
        $exTips.innerText = response.data.message + '，正在返回首页...'
        setTimeout(() => {
          window.location.href='/'
        }, 1500)
      } else {
        $exTips.innerText = response.data.message
      }
    })
  })
}

// 注册区域
function createRegisterContent() {
  const $registerContent = document.createElement('div')
  const $html = `<div class="baseblock baseForm" id="registerArea" style="display:none;">
    <div class="blocktitle">注册——扩展程序</div>
    <div class="blockcontent">
      <form method="post" class="account_form">
        <p>
          <label for="id_username">用户名:</label>
          <input type="text" name="username" required id="re_username" maxlength="16" autofocus>
          <span class="helptext">必填。5-16个字符</span></p>
        <p>
          <label for="id_password1">密码:</label>
          <input type="password" name="password1" required id="re_password1" maxlength="16">
          <span class="helptext">必填。5-16个字符</span>
        </p>
        <p>
          <label for="id_password2">密码确认:</label>
          <input type="password" name="password2" required="" id="re_password2" maxlength="16">
          <span class="helptext">为了校验，请输入与上面相同的密码。</span>
        </p>
        <button class="nbutton2" id="registerBtn" type="button" value="Submit">注册</button>
        <p>
        <a href="javscript:;" id="toLogin">已有账号？取登录</a>
      </p>
    </div>
  </div>`
  $registerContent.setAttribute('class', 'login_content')
  $registerContent.innerHTML = $html
  $mask.appendChild($registerContent)

  // 绑定登录事件
  $registerBtn = document.querySelector('#registerBtn')
  $registerBtn.addEventListener('click', function() {
    if (document.querySelector('#re_username').value.length < 5) {
      $exTips.innerText = '用户名不能少于5个字符！'
    } else if (document.querySelector('#re_password1').value.length === 0 || document.querySelector('#re_password2').value.length === 0) {
      $exTips.innerText = '请填写密码!'
    } else if (document.querySelector('#re_password1').value !== document.querySelector('#re_password2').value) {
      $exTips.innerText = '两次密码不一致!'
    } else if (document.querySelector('#re_password1').value.length < 5) {
      $exTips.innerText = '密码不能少于5个字符！'
    } else {
      const data = {
        username: document.querySelector('#re_username').value,
        password: document.querySelector('#re_password1').value,
      }
      // 向后台通信
      chrome.runtime.sendMessage({type: 'register', payload: data }, function(response) {
        if (response.data.success) {
          $exTips.innerText = response.data.message + '，正在返回首页...'
          setTimeout(() => {
            window.location.href='/'
          }, 2000)
        } else {
          $exTips.innerText = response.data.message
        }
      })
    }
  })
}

// 获取storage
function getStorage() {
  const data = chrome.storage.sync.get({ user: null, token: null }, function(items) {
    return { user: items.user, token: items.token }
  })
  return data
}

// 番剧基本信息
function getBaseInfo() {
  let other, baseInfo
  if (href.indexOf('detail') > -1) {
    const $movurl = document.querySelector('#main0').querySelectorAll('.movurl')
    for(let i = 0; i < $movurl.length; i++) {
      if ($movurl[i].getAttribute('style').indexOf('block') > -1) {
        other = $movurl[i].querySelectorAll('li')[$movurl[i].querySelectorAll('li').length - 1].innerText
      }
    }
    baseInfo = {
      fanId: href.substr(hrefIndex + 7),
      name: document.querySelector('.div_right').querySelector('.detail_imform_name').innerText,
      description: document.querySelector('.div_right').querySelector('.detail_imform_desc_pre').innerText,
      cover: document.querySelector('.div_left').querySelector('.poster').getAttribute('src'),
      region: document.querySelector('#container > div.div_left > div:nth-child(2) > div > div > ul > li:nth-child(1) > span.detail_imform_value').innerText,
      state: document.querySelector("#container > div.div_left > div:nth-child(2) > div > div > ul > li:nth-child(8) > span.detail_imform_value").innerText,
      other: other
    }
  } else if(href.indexOf('/play/') > -1) {
    const s1 = href.indexOf('/play/')
    const s2 = href.indexOf('?playid')
    const fanid = href.substring(s1 + 6, s2)
    baseInfo = {
      fanId: fanid,
      name: document.querySelector("#detailname > a").innerText,
      description: document.querySelector(".play_desc").innerText,
      cover: document.querySelector("#play_poster_img").getAttribute('src'),
      region: document.querySelector("#play_imform > li:nth-child(1) > span.play_imform_val").innerText,
      state: document.querySelector("#play_imform > li:nth-child(8) > span.play_imform_val").innerText,
      other: other
    }
  }

  return baseInfo
}

// 当前播放集, 最后播放位置
let lastPos, lastTime, cover, name, other

// 播放页判断
if (href.indexOf('/play/') > -1) {
  const $movurl = document.querySelector('#main0').querySelectorAll('.movurl')
  const $detailname = document.querySelector('#detailname')
  const s1 = href.indexOf('/play/')
  const s2 = href.indexOf('?playid')
  const fanid = href.substring(s1 + 6, s2)

  // 初始化状态
  initFn(fanid, $detailname)

  // 跳转到上次播放的位置
  if (getQueryString('lastTime')) {
    const setTime = setInterval(() => {
      const $video = document.getElementById('age_playfram').contentWindow.document.querySelector('video')
      if ($video) {
        $video.currentTime = dateToSecond(getQueryString('lastTime'))
        // 清除定时器
        clearInterval(setTime)
      }
    }, 1000)
  }

  // 信息获取
  cover = document.querySelector('#play_poster_img').getAttribute('src')
  name = document.querySelector('#detailname').innerText
  for(let i = 0; i < $movurl.length; i++) {
    if ($movurl[i].getAttribute('style').indexOf('block') > -1) {
      other = $movurl[i].querySelectorAll('li')[$movurl[i].querySelectorAll('li').length - 1].innerText
      // 遍历列表，取当前播放集
      const $lis = $movurl[i].querySelectorAll('li')
      for(let i = 0; i < $lis.length; i++) {
        if ($lis[i].querySelector('a').getAttribute('style')) {
          lastPos = $lis[i].querySelector('a').innerText
        }
      }
    }
  }
    
  // 获取当前播放位置
  const timer = setInterval(() => {
    const $video = document.getElementById('age_playfram').contentWindow.document.querySelector('video')
    if ($video) {
      lastTime = secondToDate($video.currentTime)
    }
    chrome.storage.sync.set({ lastTime: lastTime })
  }, 1000)
}

// 秒转时间
function secondToDate(second) {
  let time = parseInt(second)
  const h = Math.floor(time / 3600) < 10 ? '0'+ Math.floor(time / 3600) : Math.floor(time / 3600)
  const m = Math.floor((time / 60 % 60)) < 10 ? '0' +  Math.floor((time / 60 % 60)) : Math.floor((time / 60 % 60))
  const s = Math.floor((time % 60)) < 10 ? '0' + Math.floor((time % 60)) : Math.floor((time % 60))

  return `${h}:${m}:${s}`
}

// 时间转秒
function dateToSecond(date) {
  const h = date.split(':')[0]
  const m = date.split(':')[1]
  const s = date.split(':')[2]

  return Number(h * 3600) + Number(m * 60) + Number(s)
}

// 建立长连接
const port = chrome.runtime.connect({ name: 'connection' })

// 发送信息
port.postMessage({
  method: 'close',
  href: href,
  lastPos: lastPos,
  lastTime: lastTime,
  cover: cover,
  name: name,
  other: other
})

// token 过期跳转到登录页
function tokenFailed(res) {
  if (res.data.code === '999999') {
    const $loginArea = document.querySelector('#loginArea')
    const $loginOut = document.querySelector('.loginOut')
    $loginArea.style.display = 'block'
    $loginOut.style.display = 'none'
    chrome.storage.sync.clear(function() {
    })
  }
}

function dateFormat(fmt, date) {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(),        // 年
    'm+': (date.getMonth() + 1).toString(),     // 月
    'd+': date.getDate().toString(),            // 日
    'H+': date.getHours().toString(),           // 时
    'M+': date.getMinutes().toString(),         // 分
    'S+': date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }

  // 判断日期是否为今天
  if (new Date().getDate() === new Date(date).getDate()) {
    fmt = '今天 ' + fmt.substr(10)
  }

  return fmt
}

// 获取url参数
function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}