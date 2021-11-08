const href = window.location.href
const offsetHeight = document.querySelector('#container').offsetHeight
const site = document.location.protocol + '//' + document.domain

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
const $a3 = document.createElement('a')

$a1.setAttribute('class', 'nav_button ex_button')
$a1.setAttribute('id', 'exFavorite')
$a2.setAttribute('class', 'nav_button ex_button')
$a2.setAttribute('id', 'exHistory')
$a3.setAttribute('class', 'nav_button ex_button')
$a3.setAttribute('id', 'exChat')
$favoriteBtn.setAttribute('class', 'favorite_btn')
$unFavoriteBtn.setAttribute('class', 'favorite_btn favorited')
$mask.setAttribute('class', 'ex_mask')
$mask.setAttribute('style', `min-height:2400px; left: -4px;top: -5px;border: 4px solid #303030;`)
$exTips.setAttribute('class', 'exTips')
$loginOut.setAttribute('class', 'loginOut')
$a1.innerText = '追番'
$a2.innerText = '历史'
$a3.innerText = '交流'
$favoriteBtn.innerText = '追番'
$unFavoriteBtn.innerText = '已追番'
$nav.appendChild($a1)
$nav.appendChild($a2)
$nav.appendChild($a3)
$container.appendChild($mask)
$mask.appendChild($exTips)

let userData = {}
let currentPage = 1
let playStatus = false

// 初始化状态
chrome.storage.sync.get({ user: null, token: null }, function(items) {
  // 创建模块
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
    $loginOut.innerHTML = `<span class="user">${items.user.data.username}</span><span id="logOut" class="out"> | 退出</span>`
    userData = items.user.data
    $mask.appendChild($loginOut)
    $logOut = document.querySelector('#logOut')
    $logOut.addEventListener('click', function(ev) {
      chrome.storage.sync.clear(function() {
        window.location.href='/'
      })
    })
  }
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

  // 插件留言板
  const exCommentBlock = document.createElement('div')
  const exCommentButton = document.createElement('button')
  const $btncomment = document.getElementById('btncomment')
  const $commentsBlock = document.getElementById('comments_block')
  const $btnsParent = $btncomment.parentElement
  const $commentsParent = $commentsBlock.parentElement
  exCommentBlock.setAttribute('class', 'switchblock')
  exCommentBlock.setAttribute('hidden', true)
  exCommentButton.setAttribute('class', 'switchbtn')
  exCommentButton.setAttribute('style', 'margin-left:5px;color: #b8b8e0;')
  exCommentButton.innerText = 'EX留言板'
  $btnsParent.appendChild(exCommentButton)
  $commentsParent.appendChild(exCommentBlock)

  // 番剧评论
  const fanCommentBlock = document.createElement('div')
  const fanCommentButton = document.createElement('button')
  fanCommentBlock.setAttribute('class', 'switchblock')
  fanCommentBlock.setAttribute('hidden', true)
  fanCommentButton.setAttribute('class', 'switchbtn')
  fanCommentButton.setAttribute('style', 'margin-left:5px;color: #b8b8e0;')
  fanCommentButton.innerText = '评论'
  $btnsParent.appendChild(fanCommentButton)
  $commentsParent.appendChild(fanCommentBlock)

  // 插入评论框
  const $html = `<div id="chatArea2" class="chat_content3" style="width:100%;">
    <div class="ex-content" style="height: 105px;">
      <textarea id="exTextArea2" rows="3" cols="20" contenteditable="plaintext-only" style="border: 1px solid #404041; width: 99%; max-width: 740px; min-height: 60px; max-height:60px;user-modify: read-write-plaintext-only;" placeholder="文明交流"></textarea>
      <div id="exSubmitButton2" style="border: 1px solid #666;width: 100px; margin-top: 5px; cursor:pointer; text-align: center; line-height: 28px;height: 28px;float: right;">发 送</div>
      <span title="支持Markdown"><svg t="1622604542704" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2683" width="20" height="20"><path d="M945.6 824H75.2c-41.6 0-73.6-32-73.6-73.6V272c0-41.6 32-73.6 73.6-73.6h873.6c41.6 0 73.6 32 73.6 73.6v481.6c0 38.4-35.2 70.4-76.8 70.4z m-697.6-145.6v-192l99.2 121.6 99.2-121.6v192h96V345.6h-99.2l-99.2 121.6-99.2-121.6H145.6v334.4l102.4-1.6z m656-166.4h-99.2V345.6h-99.2V512H608l147.2 172.8L904 512z" fill="#888888" p-id="2684"></path></svg></span>
    </div>
  </div><div id="commentArea"></div>`
  exCommentBlock.innerHTML = $html
  // 给按钮添加点击事件
  const $btns = $btnsParent.querySelectorAll('.switchbtn')
  const $switchblocks = document.querySelectorAll('.switchblock')
  $btns.forEach((item, index) => {
    item.addEventListener('click', (ev) => {
      $btns.forEach(btn => {
        btn.setAttribute('class', 'switchbtn')
      })
      $switchblocks.forEach(block => {
        block.setAttribute('hidden', true)
      })
      ev.target.setAttribute('class', 'switchbtn switchbtn_current')
      $switchblocks[index].removeAttribute('hidden')
    })
  })
  // 绑定发布事件
  $exSubmitButton = document.querySelector('#exSubmitButton2')
  $exSubmitButton.addEventListener('click', function() {
    const $newTopic = document.querySelector('.newTopic')
    const $chatArea = document.querySelector('#chatArea2')
    const textContent = filterXSS(escapeHtml(document.querySelector('#exTextArea2').value))
    if (textContent.length) {
      const data = {
        userId: userData.id,
        userName: userData.username,
        content: textContent,
        pin: fanid
      }
      chrome.storage.sync.get({ user: null, token: null }, function(items) {
        if (items.token) {
          // 向后台通信
          const payload = data
          payload.token = items.token
          chrome.runtime.sendMessage({type: 'newTopic', payload: data }, function(response) {
            document.querySelector('#exTextArea2').value = ''
            // $newTopic.style.display = 'block'
            // $chatArea.style.display = 'none'
            // fetchChatData(currentPage)
            getBangumiArticle(fanid)
          })
        }
      })
    } else {
      $exTips.innerText = '内容不能为空！'
        setTimeout(() => {
          $exTips.innerText = ''
        }, 2000)
    }
  })

  // 获取bangumi评分
  const fanName = document.querySelector('.detail_imform_name').innerText
  fanCommentBlock.innerHTML = '加载中...'
  chrome.runtime.sendMessage({type: 'getBangumiSearch', name: fanName }, function(response) {
    const html = document.createElement('div')
    html.innerHTML = response.data
    const lis = html.querySelector('#browserItemList').querySelectorAll('li')
    let url, page = 1
    lis.forEach(item => {
      if (item.querySelector('.l').text === fanName) {
        url = 'https://bangumi.tv' + item.querySelector('.l').getAttribute('href') + '/comments'
      }
    })
    if (!url) {
      fanCommentBlock.innerHTML = '没有内容。'
    } else {
      let maxPage = 1
      url = url + '?page=' + page
      getPage(url)
      // 获取bangumi评论
      function getPage(url) {
        chrome.runtime.sendMessage({type: 'getBangumiComments', url: url }, function(response) {
          const html2 = document.createElement('div')
          fanCommentBlock.innerHTML = ''
          html2.innerHTML = response.data
          const lis2 = html2.querySelector('#comment_box').querySelectorAll('.item')
          lis2.forEach(item => {
            item.querySelectorAll('a').forEach(el => {
              el.setAttribute('href', 'javascript:;')
            })
          })
          // 分页
          const hasMorePage = html2.querySelector('.p_pages')
          const pageDiv = document.createElement('div')
          const pageInner = html2.querySelector('.page_inner')
          let pageHTML
          if (hasMorePage) {
            const pagesCount = html2.querySelector('.p_edge').textContent
            const str = pagesCount.replace(/\s+/g, '')
            maxPage = str.substr(str.lastIndexOf('/') + 1).replace(')', '')
            maxPage = Number(maxPage)
            pageHTML = `<div style="margin-top: 15px;">
              <span>${ pagesCount }</span>
              <span style="margin-left: 10px; cursor: pointer" class="prev">上一页</span>
              <span style="margin-left: 10px; cursor: pointer" class="next">下一页</span>
            </div>`
          } else if (pageInner) {
            const pages = pageInner.querySelectorAll('.p')
            maxPage = pages.length
            pageHTML = `<div style="margin-top: 15px;">
              <span>${ page } / ${ pages.length }</span>
              <span style="margin-left: 10px; cursor: pointer" class="prev">上一页</span>
              <span style="margin-left: 10px; cursor: pointer" class="next">下一页</span>
            </div>`
          }
          if (pageHTML) {
            pageDiv.innerHTML = pageHTML
            const prev = pageDiv.querySelector('.prev')
            const next = pageDiv.querySelector('.next')
            next.addEventListener('click', function() {
              if (page < maxPage) {
                page = page + 1
                const newurl = url.substr(0, url.indexOf('=') + 1) + page
                getPage(newurl)
              }
            })
            prev.addEventListener('click', function() {
              if (page <= maxPage && page > 1) {
                page = page - 1
                const newurl = url.substr(0, url.indexOf('=') + 1) + page
                getPage(newurl)
              }
            })
          }
          // 插入内容
          fanCommentBlock.appendChild(html2.querySelector('#comment_box'))
          fanCommentBlock.appendChild(pageDiv)
        })
      }
    }
  })

  getBangumiArticle(fanid)
  // 点击切换
  // exCommentButton()
  // 初始化状态
  initFn(fanid, $blockcontent)
}

function getBangumiArticle(fanid) {
  // 获取番剧评论
  chrome.runtime.sendMessage({type: 'getArticles', payload: { 'fanId': fanid } }, function(response) {
    if (response.data.articles && response.data.articles.length) {
      const articles = response.data.articles
      let $html = ''
      for (let i = 0; i < articles.length; i++) {
        let comments = ''
        if (articles[i].Comments.length) {
          articles[i].Comments.forEach((item, index) => {
            comments += `<div class="comment" style="margin-top: 10px;padding-top: 8px;border-top: 1px dashed #333; position: relative;">
              <div style="position: absolute;left: -14px;top: 50%;margin-top: -21px;color: #607d8b;"></div>
              <div style="margin-bottom: 5px; color: #b8b8e0;overflow:hidden;">${filterXSS(item.content)}</div>
              <div class="left">
                <span style="float: right; color: #808080; font-size: 13px">#${index + 1}</span>
                <span style="color: #808080; font-size: 13px">${item.userName}</span>
                <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(item.updatedAt)) }</span>
              </div>
            </div>`
          })
        }
        const converter = new showdown.Converter()
        const mdHtml = converter.makeHtml(articles[i].content)
        const bname = articles[i].Bangumi ? articles[i].Bangumi.name : ''
        const burl = articles[i].Bangumi ? `${site}/detail/${articles[i].Bangumi.fanId}` : ''
        let replyCount = ''
        if (articles[i].Comments.length) {
          replyCount = `<span class="replyToggle" style="color: #b8b8e0; font-size: 13px; cursor: pointer">(${articles[i].Comments.length})</span>`
        } else {
          replyCount = `<span class="replyToggle" style="color: #808080; font-size: 13px; cursor: pointer">(${articles[i].Comments.length})</span>`
        }
        $html += `<div class="item" style="padding-bottom: 20px;margin-bottom: 20px;width: 650px;word-wrap: break-word;word-break: normal;margin-left: 15px;border-bottom: 2px solid #383838;">
          <div style="margin-bottom: 5px; color: #b8b8e0;">${ filterXSS(mdHtml) }</div>
          <div style="display:flex; justify-content: space-between;word-wrap: break-word;">
            <div class="left">
              <span style="color: #808080; font-size: 13px">${ articles[i].userName }</span>
              <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(articles[i].updatedAt)) }</span>
              <a style="color: #808080; font-size: 13px;text-decoration: none;" href="${burl}">${ bname ? `来自：${bname}` : ''}</a>
            </div>
            <div class="right" style="position: relative;">
              <span class="replyButton" data-tid="${articles[i].id}" style="color: #808080; font-size: 13px; cursor: pointer">回复</span>
              ${ replyCount }
              <div class="replyWrap" style="position: absolute; display: none;right: 0px;top: -0;width: 238px;background: #202020;">
                <input class="replyInput" placeholder="输入..." type="text" value="" />
                <span class="comfirm" style="color: #808080; font-size: 13px; cursor: pointer">确定</span>
                <span class="cancle" style="color: #808080; font-size: 13px; cursor: pointer">取消</span>
              </div>
            </div>
          </div>
          <div class="replyItem" style="margin-left: 15px; display:none;">${ comments }</div>
        </div>`
      }
      const $commentArea = document.getElementById('commentArea')
      $commentArea.innerHTML = $html
      // 评论回复
      const $btns = document.querySelectorAll('.replyButton')
      const $replyToggle = document.querySelectorAll('.replyToggle')
      const $pagePrev = document.querySelector('.pagePrev')
      const $pageNext = document.querySelector('.pageNext')
      if ($pagePrev) {
        $pagePrev.addEventListener('click', ev => {
          currentPage = $pagePrev.getAttribute('data-page')
          $mask.removeChild($chatContent)
          fetchChatData(currentPage)
        })
      }
      if($pageNext) {
        $pageNext.addEventListener('click', ev => {
          currentPage = $pageNext.getAttribute('data-page')
          $mask.removeChild($chatContent)
          fetchChatData(currentPage)
        })
      }
      $replyToggle.forEach(item => {
        item.addEventListener('click', ev => {
          const $replyItem = item.parentNode.parentNode.parentNode.querySelector('.replyItem')
          if ($replyItem.style.display === 'none') {
            $replyItem.style.display = 'block'
          } else {
            $replyItem.style.display = 'none'
          }
        })
      })
      $btns.forEach(item => {
        item.addEventListener('click', ev => {
          const id = ev.target.getAttribute('data-tid')
          const $replyWrap = item.parentNode.querySelector('.replyWrap')
          const $comfirm = $replyWrap.querySelector('.comfirm')
          const $cancle = $replyWrap.querySelector('.cancle')
          const $replyInput = $replyWrap.querySelector('.replyInput')
          const $replyToggle = item.parentElement.querySelector('.replyToggle')
          const $replyItem = item.parentElement.parentElement.parentElement.querySelector('.replyItem')
          $replyWrap.style.display = 'block'
          
          $comfirm.addEventListener('click', ev => {
            const content = filterXSS(escapeHtml($replyInput.value))
            if(content.length) {
              // 向后台通信
              chrome.storage.sync.get({ user: null, token: null }, function(items) {
                if (items.token) {
                  chrome.runtime.sendMessage({
                    type: 'reply',
                    payload: { userId: items.user.data.id, userName: items.user.data.username, articleId:id, content: content, token: items.token }
                  }, function(response) {
                    // fetchChatData(currentPage)
                    const comment = response.data.comment
                    const $comments = $replyItem.querySelectorAll('.comment')
                    let $html = $replyItem.innerHTML
                    $html += `<div class="comment" style="margin-top: 10px;padding-top: 8px;border-top: 1px dashed #333; position: relative;">
                      <div style="position: absolute;left: -14px;top: 50%;margin-top: -21px;color: #607d8b;"></div>
                      <div style="margin-bottom: 5px; color: #b8b8e0;overflow:hidden;">${comment.content}</div>
                      <div class="left">
                        <span style="float: right; color: #808080; font-size: 13px">#${$comments.length + 1}</span>
                        <span style="color: #808080; font-size: 13px">${comment.userName}</span>
                        <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(comment.updatedAt)) }</span>
                      </div>
                    </div>`
                    $replyItem.innerHTML = $html
                    $replyToggle.innerText = `(${$comments.length + 1})`
                  })
                }
              })
              $replyWrap.style.display = 'none'
              $replyInput.value = ''
            } else {
              $exTips.innerText = '内容不能为空！'
              setTimeout(() => {
                $exTips.innerText = ''
              }, 2000)
            }
          })
          $cancle.addEventListener('click', ev => {
            $replyWrap.style.display = 'none'
            $replyInput.value = ''
          })
        })
      })
    }
  })
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
        removeContent()
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
        removeContent()
        createHistoryContent(response.data)
      })
    } else {
      $loginArea.style.display = 'block'
    }
  })
})

// 交流
$a3.addEventListener('click', function(ev) {
  $mask.style.display = 'block'
  currentPage = 1
  setCurent($a3)
  removeContent()
  createCommunityContent()
  fetchChatData(currentPage)
})

function removeContent() {
  // 移除列表
  $el1 = document.querySelector('.history_content')
  $el2 = document.querySelector('.favorite_content')
  $el3 = document.querySelector('.chat_content')
  $el4 = document.querySelector('.chat_content2')
  if ($el1) $el1.remove()
  if ($el2) $el2.remove()
  if ($el3) $el3.remove()
  if ($el4) $el4.remove()
}

// 获取交流区内容
function fetchChatData(currentPage) {
  const $loginArea = document.querySelector('#loginArea')
  // 向后台通信
  chrome.storage.sync.get({ user: null, token: null }, function(items) {
    if (items.token) {
      // 向后台通信
      chrome.runtime.sendMessage({
        type: 'topicList',
        payload: { userId: items.user.data.id, token: items.token, currentPage: currentPage }
      }, function(response) {
        tokenFailed(response)
        createChatContent(response.data)
      })
    } else {
      $loginArea.style.display = 'block'
    }
  })
}

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
      console.log(222, site)
      console.log(222, `<a href="${site}/detail/${data.fanId}"><img src="${data.cover}" /></a>`)
      $html += `<div class="item">
        <div class="thumb"><a href="${site}/detail/${data.fanId}"><img src="${data.cover}" /></a></div>
        <div class="info">
          <div class="title"><a href="${site}/detail/${data.fanId}">${data.name}</a></div>
          <div class="des">${data.description}</div>
          <div class="type">${data.region} | ${data.state}</div>
          <div class="state">
            ${ list[i].lastTime 
              ? 
              `看到 <a href="/${list[i].lastUrl}&lastTime=${list[i].lastTime}">
                ${list[i].lastTime.indexOf('00') === 0 ? list[i].lastTime.substring(3) : list[i].lastTime} ${list[i].lastPos ? list[i].lastPos : ''}
              </a>`
              :
              `<a href="/${list[i].lastUrl}">
                ${list[i].lastTime ? list[i].lastTime : ''} ${list[i].lastPos ? list[i].lastPos : ''}
              </a>`
            }
            ${list[i].lastTime && data.other ? '| ' : ''}${data.other ? data.other : ''}
          </div>
          <div class="state" style="margin-top: 10px">${dateFormat("YYYY年mm月dd日 HH:MM", new Date(list[i].createdAt))}</div>
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
        <div class="thumb"><a href="${site}/detail/${list[i].fanId}"><img src="${list[i].cover}" /></a></div>
        <div class="info">
          <div class="title"><a href="${site}/detail/${list[i].fanId}">${list[i].name}</a></div>
          <div class="state">
            看到
            <a href="/${list[i].lastUrl}&lastTime=${list[i].lastTime}">
              ${list[i].lastTime.indexOf('00') === 0 ? list[i].lastTime.substring(3) : list[i].lastTime} 
              ${list[i].lastPos ? list[i].lastPos : ''}
            </a>
            | ${list[i].other}
          </div>
          <div class="state" style="margin-top: 10px">${dateFormat("YYYY年mm月dd日 HH:MM", new Date(list[i].updatedAt))}</div>
        </div>
      </div>`
    }
  } else {
    $html += '<div class="empty">这里空空如也，快去看番吧！</div>'
  }

  $favoriteContent.innerHTML = $html
  $mask.appendChild($favoriteContent)
}

// 交流区
function createChatContent(list) {
  const oldEl = document.querySelector('.chat_content2')
  const articles = list.articles.rows
  const $chatContent = document.createElement('div')
  $chatContent.setAttribute('class', 'chat_content2')
  // $chatContent.style.position = 'relative'
  if (oldEl) {
    $mask.removeChild(oldEl)
  }
  // 向后台通信
  chrome.runtime.sendMessage({type: 'getLatestComments', payload: {} }, function(response) {
    if (response) {
      const latestComments = response.data.comment
      let commentItems = ''
      latestComments.forEach(item => {
        commentItems += `<div class="item">
          <div class="title" data-id="${ item.Article.id }" title="${ item.Article.content.toString() }">${ item.Article.content.toString() }</div>
          <div class="comment">${ item.content }</div>
          <div class="info">
            <span style="color: #808080; font-size: 13px">${ item.userName }</span>
            <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(item.updatedAt)) }</span>
          </div>
        </div>`
      })
      // let $html = `<div class="newTopic" style=" position: absolute; right: 85px; top: 50px; "><a href="#">发表新主题</a></div>`
      let $html = `<div class="rightSide" style="position: absolute;right: 0px;top: 50px;width: 320px;">
        <div class="newTopic"><a href="#">发表新主题</a></div>
        <div class="leastComments">
          <div class="mate">最新回复</div>
          ${ commentItems }
        </div>
        <div class="links">
          <div class="github">
            <a title="源码仓库" href= "https://github.com/leeggco/agefans_ex" target="_blank" >
              <svg t="1622274947795" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1183" width="30" height="30"><path d="M874.336 786.304c-56.96 78.016-130.496 131.84-220.64 161.856-10.304 1.824-18.368 0.448-22.848-4.032a22.4 22.4 0 0 1-7.2-17.504v-122.88c0-37.632-10.304-65.44-30.464-82.912a409.856 409.856 0 0 0 59.616-10.368 222.752 222.752 0 0 0 54.72-22.816c18.848-10.784 34.528-23.36 47.104-38.592 12.544-15.232 22.848-35.904 30.912-61.44 8.096-25.568 12.128-54.688 12.128-87.904 0-47.072-15.232-86.976-46.208-120.16 14.368-35.456 13.024-74.912-4.48-118.848-10.752-3.616-26.432-1.344-47.072 6.272a301.44 301.44 0 0 0-53.824 25.568l-21.984 13.888A407.776 407.776 0 0 0 512 291.2c-38.56 0-75.776 4.928-112.096 15.232a444.48 444.48 0 0 0-24.672-15.68c-10.336-6.272-26.464-13.888-48.896-22.432-21.952-8.96-39.008-11.232-50.24-8.064-17.024 43.936-18.368 83.424-4.032 118.848-30.496 33.632-46.176 73.536-46.176 120.608 0 33.216 4.032 62.336 12.128 87.456 8.032 25.12 18.368 45.76 30.496 61.44 12.544 15.68 28.224 28.704 47.072 39.04 18.848 10.304 37.216 17.92 54.72 22.816a409.6 409.6 0 0 0 59.648 10.368c-15.712 13.856-25.12 34.048-28.704 60.064a99.744 99.744 0 0 1-26.464 8.512 178.208 178.208 0 0 1-33.184 2.688c-13.024 0-25.568-4.032-38.144-12.544-12.544-8.512-23.296-20.64-32.256-36.32a97.472 97.472 0 0 0-28.256-30.496c-11.232-8.064-21.088-12.576-28.704-13.92l-11.648-1.792c-8.096 0-13.92 0.928-17.056 2.688-3.136 1.792-4.032 4.032-2.688 6.72 1.344 2.688 3.136 5.408 5.376 8.096 2.24 2.688 4.928 4.928 7.616 7.168l4.032 2.688c8.544 4.032 17.056 11.232 25.568 21.984 8.544 10.752 14.368 20.64 18.4 29.6l5.824 13.44c4.928 14.816 13.44 26.912 25.568 35.872 12.096 8.992 25.088 14.816 39.008 17.504 13.888 2.688 27.36 4.032 40.352 4.032 12.992 0 23.776-0.448 32.288-2.24l13.472-2.24c0 14.784 0 32.288 0.416 52.032 0 19.744 0.48 30.496 0.48 31.392a22.624 22.624 0 0 1-7.648 17.472c-4.928 4.48-12.992 5.824-23.296 4.032-90.144-30.048-163.68-83.84-220.64-161.888C92.256 708.256 64 620.352 64 523.04c0-81.152 20.192-156.064 60.096-224.672a445.184 445.184 0 0 1 163.232-163.232C355.936 95.232 430.816 75.04 512 75.04s156.064 20.192 224.672 60.096a445.184 445.184 0 0 1 163.232 163.232C939.808 366.528 960 441.888 960 523.04c0 97.76-28.704 185.216-85.664 263.264z" p-id="1184" fill="#808080"></path></svg>
            </a>
          </div>
        </div>
      </div>`
      if (articles.length) {
        $html += '<div class="articleBox"><div class="articleList">'
        for (let i = 0; i < articles.length; i++) {
          let comments = ''
          if (articles[i].Comments.length) {
            articles[i].Comments.forEach((item, index) => {
              comments += `<div style="margin-top: 10px;padding-top: 8px;border-top: 1px dashed #333; position: relative;">
                <div style="position: absolute;left: -14px;top: 50%;margin-top: -21px;color: #607d8b;"></div>
                <div style="margin-bottom: 5px; color: #b8b8e0;overflow:hidden;">${item.content}</div>
                <div class="left">
                  <span style="float: right; color: #808080; font-size: 13px">#${index + 1}</span>
                  <span style="color: #808080; font-size: 13px">${item.userName}</span>
                  <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(item.updatedAt)) }</span>
                </div>
              </div>`
            })
          }
          const converter = new showdown.Converter()
          // const mdHtml = articles[i].content)
          const mdHtml = converter.makeHtml(articles[i].content)
          const bname = articles[i].Bangumi ? articles[i].Bangumi.name : ''
          const burl = articles[i].Bangumi ? `${site}/detail/${articles[i].Bangumi.fanId}` : ''
          let replyCount = ''
          if (articles[i].Comments.length) {
            replyCount = `<span class="replyToggle" style="color: #b8b8e0; font-size: 13px; cursor: pointer">(${articles[i].Comments.length})</span>`
          } else {
            replyCount = `<span class="replyToggle" style="color: #808080; font-size: 13px; cursor: pointer">(${articles[i].Comments.length})</span>`
          }
          $html += `<div class="item" style="padding-bottom: 20px;margin-bottom: 20px;width: 650px;word-wrap: break-word;word-break: normal;margin-left: 15px;border-bottom: 2px solid #383838;">
            <div style="margin-bottom: 5px; color: #b8b8e0;">${ filterXSS(mdHtml) }</div>
            <div style="display:flex; justify-content: space-between;word-wrap: break-word;">
              <div class="left">
                <span style="color: #808080; font-size: 13px">${ articles[i].userName }</span>
                <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(articles[i].updatedAt)) }</span>
                <a style="color: #808080; font-size: 13px;text-decoration: none;" href="${burl}">${ bname ? `来自：${bname}` : ''}</a>
              </div>
              <div class="right" style="position: relative;">
                <span class="replyButton" data-tid="${articles[i].id}" style="color: #808080; font-size: 13px; cursor: pointer">回复</span>
                ${ replyCount }
                <div class="replyWrap" style="position: absolute; display: none;right: 0px;top: -0;width: 238px;background: #202020;">
                  <input class="replyInput" placeholder="输入..." type="text" value="" />
                  <span class="comfirm" style="color: #808080; font-size: 13px; cursor: pointer">确定</span>
                  <span class="cancle" style="color: #808080; font-size: 13px; cursor: pointer">取消</span>
                </div>
              </div>
            </div>
            <div class="replyItem" style="margin-left: 15px; display:none;">${ comments }</div>
          </div>`
        }
        if (articles.length && list.pagination) {
          $html += `<span style="font-size: 12px; cursor: pointer;margin-left: 15px;">第${list.pagination.currentPage}页</span>`
          if (list.pagination.currentPage > 1) {
            $html += `<a href="#" class="firstPage" data-page="1" style="font-size: 12px; cursor: pointer; margin-left: 15px;">第一页</a><a href="#" class="pagePrev" data-page="${list.pagination.currentPage - 1}" style="font-size: 12px; cursor: pointer; margin-left: 15px;">上一页</a>`
          }
          if (list.pagination.currentPage * list.pagination.pageSize < list.pagination.total) {
            $html += `<a href="#" class="pageNext" data-page="${list.pagination.currentPage + 1}" style="font-size: 12px; cursor: pointer;margin-left: 15px;">下一页</a>`
          }
        }
        $html += "</div><div class='detailBox'><a style='float: right; margin-top: -25px; font-size: 14px;' class='backLink' href='javascript:;'>关闭</a><div class='articleDetail' style='margin-top: 20px;'></div></div></div>"
      } else {
        $html += '<div class="empty">这里静悄悄的呢！</div>'
      }
      $chatContent.innerHTML = $html
      $mask.appendChild($chatContent)
      const $articleList = document.querySelector('.articleList')
      const $articleDetail = document.querySelector('.articleDetail')
      const $detailBox = document.querySelector('.detailBox')
      const $backLink = document.querySelector('.backLink')
      // 最近回复
      const $titles = document.querySelector('.leastComments').querySelectorAll('.title')
      $titles.forEach((item) => {
        item.addEventListener('click', (ev) => {
          const id = ev.target.getAttribute('data-id')
          $articleList.style.display = 'none'
          $detailBox.style.display = 'block'
          document.querySelector('#chatArea').style.display = 'none'
          document.querySelector('.newTopic').style.display = 'block'
          // 向后台通信
          getArticleDetail(id)
        })
      })
      $backLink.addEventListener('click', (ev) => {
        $articleList.style.display = 'block'
        $detailBox.style.display = 'none'
      })
    
      // 评论回复
      const $btns = document.querySelectorAll('.replyButton')
      const $replyToggle = document.querySelectorAll('.replyToggle')
      const $firstPage = document.querySelector('.firstPage')
      const $pagePrev = document.querySelector('.pagePrev')
      const $pageNext = document.querySelector('.pageNext')
      const $newTopic = document.querySelector('.newTopic')
      const $chatArea = document.querySelector('#chatArea')
      $newTopic.addEventListener('click', ev => {
        document.querySelector('.detailBox').style.display = 'none'
        document.querySelector('.articleList').style.display = 'block'
        $chatArea.style.display = 'block'
        $newTopic.style.display = 'none'
      })
      if ($pagePrev) {
        $pagePrev.addEventListener('click', ev => {
          currentPage = $pagePrev.getAttribute('data-page')
          $mask.removeChild($chatContent)
          fetchChatData(currentPage)
        })
      }
      if ($firstPage) {
        $firstPage.addEventListener('click', ev => {
          currentPage = $firstPage.getAttribute('data-page')
          $mask.removeChild($chatContent)
          fetchChatData(currentPage)
        })
      }
      if($pageNext) {
        $pageNext.addEventListener('click', ev => {
          currentPage = $pageNext.getAttribute('data-page')
          $mask.removeChild($chatContent)
          fetchChatData(currentPage)
        })
      }
      $replyToggle.forEach(item => {
        item.addEventListener('click', ev => {
          const $replyItem = item.parentNode.parentNode.parentNode.querySelector('.replyItem')
          if ($replyItem.style.display === 'none') {
            $replyItem.style.display = 'block'
          } else {
            $replyItem.style.display = 'none'
          }
        })
      })
      $btns.forEach(item => {
        item.addEventListener('click', ev => {
          const id = ev.target.getAttribute('data-tid')
          const $replyWrap = item.parentNode.querySelector('.replyWrap')
          const $comfirm = $replyWrap.querySelector('.comfirm')
          const $cancle = $replyWrap.querySelector('.cancle')
          const $replyInput = $replyWrap.querySelector('.replyInput')
          $replyWrap.style.display = 'block'
          
          $comfirm.addEventListener('click', ev => {
            const content = filterXSS(escapeHtml($replyInput.value))
            if(content.length) {
              // 向后台通信
              chrome.storage.sync.get({ user: null, token: null }, function(items) {
                if (items.token) {
                  chrome.runtime.sendMessage({
                    type: 'reply',
                    payload: { userId: items.user.data.id, userName: items.user.data.username, articleId:id, content: content, token: items.token }
                  }, function(response) {
                    fetchChatData(currentPage)
                  })
                }
              })
              $replyWrap.style.display = 'none'
              $replyInput.value = ''
            } else {
              $exTips.innerText = '内容不能为空！'
              setTimeout(() => {
                $exTips.innerText = ''
              }, 2000)
            }
          })
          $cancle.addEventListener('click', ev => {
            $replyWrap.style.display = 'none'
            $replyInput.value = ''
          })
        })
      })
    }
  })
}

function getArticleDetail(id) {
  const $articleList = document.querySelector('.articleList')
  const $articleDetail = document.querySelector('.articleDetail')
  chrome.storage.sync.get({ user: null, token: null }, function (items) {
    if (items.token) {
      chrome.runtime.sendMessage(
        {
          type: 'getArticleDetail',
          payload: {
            userId: items.user.data.id,
            userName: items.user.data.username,
            id: id,
            token: items.token,
          },
        },
        function (response) {
          let $html = ''
          const article = response.data.article
          let comments = ''
          if (article.Comments.length) {
            article.Comments.forEach((item, index) => {
              comments += `<div style="margin-top: 10px;padding-top: 8px;border-top: 1px dashed #333; position: relative;">
                <div style="position: absolute;left: -14px;top: 50%;margin-top: -21px;color: #607d8b;"></div>
                <div style="margin-bottom: 5px; color: #b8b8e0;overflow:hidden;">${item.content}</div>
                <div class="left">
                  <span style="float: right; color: #808080; font-size: 13px">#${index + 1}</span>
                  <span style="color: #808080; font-size: 13px">${item.userName}</span>
                  <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(item.updatedAt)) }</span>
                </div>
              </div>`
            })
          }
          const converter = new showdown.Converter()
          const mdHtml = converter.makeHtml(filterXSS(article.content))
          const bname = article.Bangumi ? article.Bangumi.name : ''
          const burl = article.Bangumi ? `${site}/detail/${article.Bangumi.fanId}` : ''
          let replyCount = ''
          if (article.Comments.length) {
            replyCount = `<span class="replyToggle" style="color: #b8b8e0; font-size: 13px; cursor: pointer">(${article.Comments.length})</span>`
          } else {
            replyCount = `<span class="replyToggle" style="color: #808080; font-size: 13px; cursor: pointer">(${article.Comments.length})</span>`
          }
          $html += `<div class="item" style="padding-bottom: 20px;margin-bottom: 20px;width: 650px;margin-left: 15px;border-bottom: 2px solid #383838;">
            <div style="margin-bottom: 5px; color: #b8b8e0;">${ mdHtml }</div>
            <div style="display:flex; justify-content: space-between;word-wrap: break-word;">
              <div class="left">
                <span style="color: #808080; font-size: 13px">${ article.userName }</span>
                <span style="color: #808080; font-size: 13px">${ dateFormat("YYYY年mm月dd日 HH:MM", new Date(article.updatedAt)) }</span>
                <a style="color: #808080; font-size: 13px;text-decoration: none;" href="${burl}">${ bname ? `来自：${bname}` : ''}</a>
              </div>
              <div class="right" style="position: relative;">
                <span class="replyButton" data-tid="${article.id}" style="color: #808080; font-size: 13px; cursor: pointer">回复</span>
                ${ replyCount }
                <div class="replyWrap" style="position: absolute; display: none;right: 0px;top: -0;width: 238px;background: #202020;">
                  <input class="replyInput" placeholder="输入..." type="text" value="" />
                  <span class="comfirm" style="color: #808080; font-size: 13px; cursor: pointer">确定</span>
                  <span class="cancle" style="color: #808080; font-size: 13px; cursor: pointer">取消</span>
                </div>
              </div>
            </div>
            <div class="replyItem" style="margin-left: 15px;">${ comments }</div>
          </div>`
          $articleDetail.innerHTML = $html
  
          // 评论回复
          const $btns = document.querySelectorAll('.replyButton')
          $btns.forEach(item => {
            item.addEventListener('click', ev => {
              const id = ev.target.getAttribute('data-tid')
              const $replyWrap = item.parentNode.querySelector('.replyWrap')
              const $comfirm = $replyWrap.querySelector('.comfirm')
              const $cancle = $replyWrap.querySelector('.cancle')
              const $replyInput = $replyWrap.querySelector('.replyInput')
              $replyWrap.style.display = 'block'
              
              $comfirm.addEventListener('click', ev => {
                const content = filterXSS(escapeHtml($replyInput.value))
                if(content.length) {
                  // 向后台通信
                  chrome.storage.sync.get({ user: null, token: null }, function(items) {
                    if (items.token) {
                      chrome.runtime.sendMessage({
                        type: 'reply',
                        payload: { userId: items.user.data.id, userName: items.user.data.username, articleId:id, content: content, token: items.token }
                      }, function(response) {
                        getArticleDetail(id)
                      })
                    }
                  })
                  $replyWrap.style.display = 'none'
                  $replyInput.value = ''
                } else {
                  $exTips.innerText = '内容不能为空！'
                  setTimeout(() => {
                    $exTips.innerText = ''
                  }, 2000)
                }
              })
              $cancle.addEventListener('click', ev => {
                $replyWrap.style.display = 'none'
                $replyInput.value = ''
              })
            })
          })
        }
      )
    }
  })
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
        <a href="javscript:;" id="toLogin">已有账号？去登录</a>
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

// 交流区域
function createCommunityContent() {
  const $chatContent = document.createElement('div')
  const $html = `<div id="chatArea" class="chat_content" style="display:none; width: 650px; margin-left: 15px; padding-top: 15px;">
    <div class="ex-content" style=" height: 105px;">
      <textarea id="exTextArea" rows="3" cols="20" contenteditable="plaintext-only" style="border: 1px solid #404041; width: 650px; max-width: 740px; min-height: 60px; max-height:60px;user-modify: read-write-plaintext-only;" placeholder="阿巴阿巴~"></textarea>
      <div id="exSubmitButton" style="border: 1px solid #666;width: 100px; margin-top: 5px; cursor:pointer; text-align: center; line-height: 28px;height: 28px;float: right;">发 送</div>
      <a href="javascript:;" id="cancel" style="float: right; font-size: 14px; cursor: pointer; margin-top: 13px; margin-right:10px;">取消</a>
      <span title="支持Markdown"><svg t="1622604542704" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2683" width="20" height="20"><path d="M945.6 824H75.2c-41.6 0-73.6-32-73.6-73.6V272c0-41.6 32-73.6 73.6-73.6h873.6c41.6 0 73.6 32 73.6 73.6v481.6c0 38.4-35.2 70.4-76.8 70.4z m-697.6-145.6v-192l99.2 121.6 99.2-121.6v192h96V345.6h-99.2l-99.2 121.6-99.2-121.6H145.6v334.4l102.4-1.6z m656-166.4h-99.2V345.6h-99.2V512H608l147.2 172.8L904 512z" fill="#888888" p-id="2684"></path></svg></span>
    </div>
  </div>`
  $chatContent.setAttribute('class', 'chat_content')
  $chatContent.innerHTML = $html
  $mask.appendChild($chatContent)

  // 绑定发布事件
  $exSubmitButton = document.querySelector('#exSubmitButton')
  $cancel = document.querySelector('#cancel')
  $exSubmitButton.addEventListener('click', function() {
    const $newTopic = document.querySelector('.newTopic')
    const $chatArea = document.querySelector('#chatArea')
    const textContent = filterXSS(escapeHtml(document.querySelector('#exTextArea').value))
    if (textContent.length) {
      $exSubmitButton.innerText = '发送中'
      const data = {
        userId: userData.id,
        userName: userData.username,
        content: textContent
      }
      chrome.storage.sync.get({ user: null, token: null }, function(items) {
        if (items.token) {
          // 向后台通信
          const payload = data
          payload.token = items.token
          chrome.runtime.sendMessage({type: 'newTopic', payload: data }, function(response) {
            document.querySelector('#exTextArea').value = ''
            $newTopic.style.display = 'block'
            $chatArea.style.display = 'none'
            $exSubmitButton.innerText = '发 送'
            fetchChatData(currentPage)
          })
        }
      })
    } else {
      $exTips.innerText = '写点什么吧！'
      setTimeout(() => {
        $exTips.innerText = ''
      }, 2000)
    }
  })
  $cancel.addEventListener('click', function() {
    const $newTopic = document.querySelector('.newTopic')
    const $chatArea = document.querySelector('#chatArea')
    document.querySelector('#exTextArea').value = ''
    $newTopic.style.display = 'block'
    $chatArea.style.display = 'none'
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

// 自动播放下一集
function autoPlayToNextEpisode() {
  let hrefURL = new URL(href);
  if (hrefURL.searchParams.has('playid')) {
    // 获取当前集
    let currentEpisode = document.querySelectorAll(`[href='${hrefURL.pathname}?playid=${hrefURL.searchParams.get('playid')}']`)[0].parentNode;
    // 获取下一集
    let nextEpisode = currentEpisode.nextElementSibling;
    // 点击
    if (nextEpisode !== null) {
      nextEpisode.firstElementChild.click();
    }
  }
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
    // TODO: 这里的逻辑应该改为页面加载完后只实例化一个$video
    const $video = document.getElementById('age_playfram').contentWindow.document.querySelector('video')
    if ($video) {
      lastTime = secondToDate($video.currentTime)
      if (!playStatus) {
        $video.play();
        playStatus = true;
      }
      // 播放快完的时候自动跳到下一集
      if (!isNaN($video.duration)) {
        if ($video.currentTime * 1.0 / $video.duration === 1) {
          // autoPlayToNextEpisode()
        }
      }
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
    fmt = '今天 ' + fmt.substr(10).replace('日', '')
  }

  return fmt
}

// 获取url参数
function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}
// HTML 转译
function escapeHtml(str) {
    str = str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quto;')
      .replace(/'/g, '&#39;')
      .replace(/ /g, '&#32;')
  return str
}