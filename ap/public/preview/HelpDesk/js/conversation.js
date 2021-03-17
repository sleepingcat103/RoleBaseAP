// const CnvsnPnl = (function () {
  const set = {
    sel: {  //selector
      pmpm: '#pmpm',
      info: '#info',
      crop: '.crop',
      send: '.send',
      inputDiv: '#inputDIV',
      logo: '.chatBotLogo',
      close: '.chatBotClose',
      btnNo: '.btnNo',
      modal: '.modal',
      latest: '.latest',
      backdrop: '#backdrop',
      typingbot: '#typingbot',
      textInput: '#textInput',
      chatBox: '#scrollingChat',
      chatColumn: '.chat-column',
      maximize: '.fa-window-maximize',
      downloadButton: '.downloadButton',
    },
    rply: {
      download: '下載檔案中...', //(已為您下載檔案)
      url: '(已為您導到新頁面)',
      mailto: '(已為您開啟信件)'
    }
  };
  
  function displayMessage(newPayload, isUser) {
    let wastonDivStyle = newPayload.style;
    //console.log("wastonDivStyle:",wastonDivStyle);
    if ((newPayload && newPayload.generic) || newPayload.input) {  //watson回傳的 || 使用者輸入
      let responses = buildMessageDomElements(newPayload, isUser);
      let chatBoxElement = document.querySelector(set.sel.chatBox);
      setResponse(responses, isUser, chatBoxElement, 0, true, wastonDivStyle);
    }
  }
  function setResponse(responses, isUser, chatBoxElement, index, isTop, wastonDivStyle) {
    //console.log(responses)
    if (index < responses.length) {
      let res = responses[index];
      let istext = res.type == 'text' ? true : false
      let currentDiv = getDivObject(res, isUser, isTop, istext, wastonDivStyle);
      let input = document.querySelector(set.sel.textInput);
      chatBoxElement.appendChild(currentDiv);
      currentDiv.classList.add('load');
      setTimeout(function () {
        scrollToChatBottom();
      }, 150);
      document.querySelector(set.sel.typingbot).classList.add('hide')
      setResponse(responses, isUser, chatBoxElement, index + 1, false, wastonDivStyle);
      input.removeAttribute('disabled')
      input.focus()
    }
  }
  function getDivObject(res, isUser, isTop, isText, wastonDivStyle) {
    let classes = [(isUser ? 'from-user' : 'from-watson'), 'latest', (isTop ? 'top' : 'sub')];
    let text = !isUser && isText ? 'watsontext' : 'usertext'   //class 設定選擇
    // console.log('text:',text);
    let messageJson;
    if (wastonDivStyle == '1') {
      let welcomeClass = isTop ? 'welcomeTop' : 'welcomeSub';
      messageJson = {
        // <div class='segments'>
        'tagName': 'div',
        'classNames': ['segments'],
        'children': [{
          // <div class='welcomeClass'>
          'tagName': 'div',
          'classNames': ['one', welcomeClass],
          'children': [{
            // <div class='welcome'>
            'tagName': 'div',
            'classNames': ['welcome'],
            'children': [{
              // <p>{messageText}</p>
              'tagName': 'p',
              'text': res.innerhtml
            }]
          }]
        }]
      };
    }
    else if (wastonDivStyle == '3') {
      messageJson = {
        // <div class='segments'>
        'tagName': 'div',
        'classNames': ['segments'],
        'children': [{
          // <div class='blackBox'>
          'tagName': 'div',
          'classNames': ['blackBox'],
          'children': [{
            // <div class='blackBox-img'>
            'tagName': 'div',
            'classNames': ['blackBox-img'],
            'children': [{
              // <p>{messageText}</p>
              'tagName': 'p',
              'text': ' '
            }]
          }, {
            // <div class='blackBox-inner'>
            'tagName': 'div',
            'classNames': ['blackBox-inner', text],
            'children': [{
              // <p>{messageText}</p>
              'tagName': 'p',
              'text': res.innerhtml
            }]
          }]
        }]
      };
    }
    else if (wastonDivStyle == '4') {
      messageJson = {
        // <div class='segments'>
        'tagName': 'div',
        'classNames': ['segments'],
        'children': [{
          // <div class='finishClick'>
          'tagName': 'div',
          'classNames': ['finishClick'],
          'children': [{
            // <p>{messageText}</p>
            'tagName': 'p',
            'text': res.innerhtml
          }]
        }]
      };
    }
    else {
      messageJson = {
        // <div class='segments'>
        'tagName': 'div',
        'classNames': ['segments'],
        'children': [{
          // <div class='from-user/from-watson latest'>
          'tagName': 'div',
          'classNames': classes,
          'children': [{
            // <div class='message-inner'>
            'tagName': 'div',
            'classNames': ['message-inner', text],
            'children': [{
              // <p>{messageText}</p>
              'tagName': 'p',
              'text': res.innerhtml
            }]
          }]
        }]
      };
    }
    return buildDomElement(messageJson);
  }
  function buildMessageDomElements(newPayload, isUser) {
    let responses = [];
    let textArray = isUser ? newPayload.input.text : newPayload.text;
    //console.log('textArray:',textArray);
    if (Object.prototype.toString.call(textArray) !== '[object Array]') {
      textArray = [textArray];
    }
    if (newPayload.hasOwnProperty('generic')) {
      let generic = newPayload.generic;
      generic.forEach(function (gen) {
        getResponse(responses, gen);
      });
    } else if (newPayload.hasOwnProperty('input')) {
      let input = '';
      textArray.forEach(function (msg) {
        input += msg + ' ';
      });
      input = input.trim()
        .replace(/&/g, '&amp;')  //替換
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (input.length !== 0) {
        responses.push({
          type: 'text',
          innerhtml: input
        });
      }
    }
    return responses;
  }
  function getResponse(responses, gen) {
    let title = '';
    if (gen.hasOwnProperty('title')) {
      title = '<div>' + gen.title + '</div>';
    }
    sessionStorage.setItem('last_type', gen.response_type);
    switch (gen.response_type) {
      case 'text':
        responses.push({
          type: gen.response_type,
          innerhtml: gen.text
        });
        break;

      case 'option':
        let list = getOptions(gen.options);
        responses.push({
          type: gen.response_type,
          innerhtml: title + list
        });
        sessionStorage.setItem('buttons', JSON.stringify(gen.options));
        break;

      case 'image':
        let img = '<div><img class="chatimg" src="' + gen.source + '" ></div>';
        responses.push({
          type: gen.response_type,
          innerhtml: title + img
        });
        break;

      case "card":
        responses.push({
          type: gen.response_type,
          innerhtml: getCard(gen.card),
        });
        sessionStorage.setItem('buttons', JSON.stringify(gen.card.button));
        break;

      case "slider":
        responses.push({
          type: gen.response_type,
          innerhtml: getslider(gen.sliders),
        });
        sessionStorage.setItem('buttons', JSON.stringify(gen.sliders));
        break;

      case "suggestion":
        responses.push({
          type: gen.response_type,
          innerhtml: getSuggestion(gen.suggestion),
        });
        sessionStorage.setItem('buttons', JSON.stringify(gen.suggestion.button));
        break;
    }
  }
  function getOptions(optionsList) {
    let list = '';
    if (optionsList != null) {
      optionsList.forEach(function (element) {
        let id = element.value.input.text;
        //console.log('ID:',id);
        if (element.value.input.type == 'nextto') {   //opdis(this)     //sendMessage(\'' + element.value.input.text + '\',\'button\',\'' + element.value.input.value + '\'); 
          let item = '<div class="options-button" id="' + id + '" onclick="sendMessage(\'' + element.value.input.text + '\',\'button\',\'' + element.value.input.value + '\'); toChangeButtonColor(this,id)">' + element.label + '</div>'
          list += item;
        } else if (element.value.input.type == 'url') {
          // id='URLchange';
          let item = '<a class="options-button" id="' + id + '" href="' + element.value.input.value + '"; target="_blank"; rel="noreferrer noopener"; onclick="sendMessage(\'' + element.value.input.text + '\',\'button\'); clickDisplay(\'url\');toChangeButtonColor(this,id);">' + element.label + '</a>'
          list += item;
        }
        else if (element.value.input.type == 'download') {// sendMessage(\'' + element.value.input.text + '\',\'button\');
          // id='DOWNLOADchange';
          //console.log('element.value.input.value : ',element.value.input.value);
          let item = '<a class="options-button" id="' + id + '" onclick="clickDisplay(\'download\');toChangeButtonColor(this,id); Api.downloadButton(\'' + element.value.input.value + '\');">' + element.label + '</a>'
          list += item;
        }
        else if (element.value.input.type == 'mailto') {
          // id='MAILTOchange';
          let item = '<a class="options-button" id="' + id + '" onclick="sendMessage(\'' + element.value.input.text + '\',\'button\'); clickDisplay(\'mailto\');toChangeButtonColor(this,id)" href="mailto:' + element.value.input.value.mailName + '?subject=' + element.value.input.value.mailTitle + '&body=' + element.value.input.value.mailBody + '">' + element.label + '</a>'
          list += item;
        }
      })
    }
    return list;
  }
  function toChangeButtonColor(box, id) {   // 點選button後更改顏色
    // console.log("box :",box.parentNode.parentNode.classList);
    if (box.parentNode.parentNode.classList[0] == "message-inner") {
      box.style.color = "#E60021";
      box.style.border = "1px solid #E60021";
    }
    if (box.parentNode.parentNode.classList[0] == "welcome") {
      document.getElementById(id).className = "options-button-visited";
      box.style.background = "url('../img/Q2.png')";
      box.style.backgroundPosition = "2px 3px";
      box.style.backgroundRepeat = "no-repeat";
      box.style.backgroundColor = "#E5E5E5";
      // console.log(box.style);
    }
    if (box.parentNode.parentNode.classList[0] == "blackBox-inner") {
      document.getElementById(id).className = "blackBox-visited";
    }

    if (id == "") {
      box.style.color = "#E60021";
      box.style.backgroundColor = "#D0D0D0";
    }
  }
  function getslider(sliders) {
    let inside = "";
    let items = '<div class="outside"><div class="slider">';
    if (sliders) {
      sliders.forEach(function (slider) {
        inside = '<div class="inside"><img src="' + slider.picSrc + '"><h3>' + slider.title + '</h3><h4>' + slider.info + '</h4>';
        if (slider.button) {
          let btns = getButtons(slider.button);
          inside += btns + '</div>';
        } else {
          inside += '</div>';
        }
        items += inside;
      })

      items += '</div></div><button class="left" onclick="left(this)"><i class="fa fa-angle-left"></i></button><button class="right" onclick="right(this)"><i class="fa fa-angle-right"></i></button>'
    }
    return items;
  };
  function getCard(card) {
    let items = "";
    if (card) {
      let item = '<div class="inside"><img src="' + card.picSrc + '"><h3>' + card.title + '</h3><h4>' + card.info + '</h4>';
      if (card.button) {
        let btns = getButtons(card.button);
        item += btns + '</div>';
      } else {
        item += '</div>';
      }
      items += item;
    }
    return items;
  };
  function getSuggestion(suggestion) {
    let items = "";
    if (suggestion) {
      let item = '<div class="inside"><h3>' + suggestion.title + '</h3><h4>' + suggestion.information + '</h4>';
      if (suggestion.button) {
        let button = getButtons(suggestion.button);
        item += button + '</div>';
      } else {
        item += '</div>';
      }
      items += item;
    }
    return items;
  };
  function getButtons(buttons) {
    let btn = "";
    if (buttons) {
      buttons.forEach(function (element) {
        let id = '';
        if (element.btnType == "nextto") {
          let item = '<a onclick="sendMessage(\'' + element.btnText + '\',\'button\',\'' + element.btnValue + '\'); toChangeButtonColor(this,id)">' + element.btnLabel + '</a>';
          btn += item;
        } else if (element.btnType == "url") {
          let item = '<a href="' + element.btnValue + '"; target="_blank"; rel="noreferrer noopener"; onclick="sendMessage(\'' + element.btnText + '\',\'button\'); clickDisplay(\'url\');">' + element.btnLabel + '</a>';
          btn += item;
        } else if (element.btnType == "download") {   // sendMessage(\'' + element.btnText + '\',\'button\');
          let item = '<a onclick="clickDisplay(\'download\'); Api.downloadButton(\'' + element.btnValue + '\');">' + element.btnLabel + '</a>';
          btn += item;
        } else if (element.btnType == "mailto") {
          let item = '<a onclick="sendMessage(\'' + element.btnText + '\',\'button\'); clickDisplay(\'mailto\'); " href="mailto:' + element.btnValue.mailName + '?subject=' + element.btnValue.mailTitle + '&body=' + element.btnValue.mailBody + '">' + element.btnLabel + '</a>';
          btn += item;
        }
      });
    }
    return btn;
  };
  function right(box) {
    let sld = box.previousElementSibling.previousElementSibling.children[0]
    if (!sld.style.cssText) {
      sld.style.transform = "translateX(-240px)"
    }
    else if (parseInt(sld.style.cssText.match(/-?\d+/)[0]) > -((sld.childElementCount - 1) * 240)) {
      sld.style.transform = 'translateX(' + (parseInt(sld.style.cssText.match(/-?\d+/)[0]) - 240) + 'px)'
    }
    return
  }
  function left(box) {
    let sld = box.previousElementSibling.children[0]
    if (!sld.style.cssText) {
      sld.style.transform = "translateX(0px)"
    }
    else if (parseInt(sld.style.cssText.match(/-?\d+/)[0]) < 0) {
      sld.style.transform = 'translateX(' + (parseInt(sld.style.cssText.match(/-?\d+/)[0]) + 240) + 'px)'
    }
    return
  }
  function scrollToChatBottom() {
    let chatBox = document.querySelector(set.sel.chatBox);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  function clickDisplay(type) {
    let newPayload;
    if (type === "download") {
      newPayload = {
        'style': '4',
        'generic': [
          {
            'response_type': 'text',
            'text': set.rply.download
          }
        ],
      }
    } else if (type === "url") {
      newPayload = {
        'style': '4',
        'generic': [
          {
            'response_type': 'text',
            'text': set.rply.url
          }
        ],
      }
    } else if (type === "mailto") {
      newPayload = {
        'style': '4',
        'generic': [
          {
            'response_type': 'text',
            'text': set.rply.mailto
          }
        ],
      }
    }
    //console.log('type :' ,type,'newPayload : ',newPayload)
    displayMessage(newPayload, false);
  }  
  function init() {
    displayMessage(TYPES.word(" --- 文字(w) - style 1  --- "), false)
    displayMessage(TYPES.w(1), false)
    displayMessage(TYPES.word(" --- 文字(w) - style 2  --- "), false)
    displayMessage(TYPES.w(2), false)
    displayMessage(TYPES.word(" --- 文字(w) - sytle 3 --- "), false)
    displayMessage(TYPES.w(3), false)
    displayMessage(TYPES.word(" --- 文字(w) - sytle 4 --- "), false)
    displayMessage(TYPES.w(4), false)
    displayMessage(TYPES.word(" --- 按鈕(B) - style 1 --- "), false)
    displayMessage(TYPES.b(1), false)
    displayMessage(TYPES.word(" --- 按鈕(B) - style 2 --- "), false)
    displayMessage(TYPES.b(2), false)
    displayMessage(TYPES.word(" --- 按鈕(B) - sytle 3 --- "), false)
    displayMessage(TYPES.b(3), false)
    displayMessage(TYPES.word(" --- 按鈕(B) - sytle 4 --- "), false)
    displayMessage(TYPES.b(4), false)
    displayMessage(TYPES.word(" --- 圖片(P) - style 1 --- "), false)
    displayMessage(TYPES.p(1), false)
    displayMessage(TYPES.word(" --- 圖片(P) - style 2 --- "), false)
    displayMessage(TYPES.p(2), false)
    displayMessage(TYPES.word(" --- 圖片(P) - sytle 3 --- "), false)
    displayMessage(TYPES.p(3), false)
    displayMessage(TYPES.word(" --- 圖片(P) - sytle 4 --- "), false)
    displayMessage(TYPES.p(4), false)
    displayMessage(TYPES.word("--- W+B ---"), false)
    displayMessage(TYPES.wb(), false)
    displayMessage(TYPES.word("--- W+P ---"), false)
    displayMessage(TYPES.wp(), false)
    displayMessage(TYPES.word("--- W+B+P ---"), false)
    displayMessage(TYPES.wbp(), false)
    displayMessage(TYPES.word(" --- 卡片(Card) --- "), false)
    displayMessage(TYPES.card(), false)
    displayMessage(TYPES.word(" --- 輪播(Slider) --- "), false)
    displayMessage(TYPES.slider(), false)
    displayMessage(TYPES.word(" --- SUGGESTION --- "), false)
    displayMessage(TYPES.suggestion(), false)
    update();
  }

  function buildDomElement(domJson) {
    //tagName :div|img|and so on
    let element = document.createElement(domJson.tagName);

    // Fill the "content" of the element
    if (domJson.text) {
      element.innerHTML = domJson.text
        .replace(/script/g, "")
        .replace(/iframe/g, "")
        .replace(/select/g, "")
        .replace(/\*/g, "")
        .replace(/form/g, "")
        .replace(/where/g, "")
        .replace(/drop/g, "")
        .replace(/join/g, "")
        .replace(/#/g, "")
        .replace(/create/g, "")
        .replace(/insert/g, "")
    } else if (domJson.html) {
      element.insertAdjacentHTML('beforeend', domJson.html);
    }
    if (domJson.classNames) {
      for (let i = 0; i < domJson.classNames.length; i++) {
        element.classList.add(domJson.classNames[i]);
      }
    }
    // Add attributes to the element
    if (domJson.attributes) {
      for (let j = 0; j < domJson.attributes.length; j++) {
        let currentAttribute = domJson.attributes[j];
        element.setAttribute(currentAttribute.name, currentAttribute.value);
      }
    }
    // Add children elements to the element
    if (domJson.children) {
      for (let k = 0; k < domJson.children.length; k++) {
        let currentChild = domJson.children[k];
        element.appendChild(buildDomElement(currentChild));
      }
    }
    return element;
  }

//   return {
//     left: left,
//     init: init,
//     right: right,
//     displayMessage: displayMessage,
//     toChangeButtonColor: toChangeButtonColor,
//     clickDisplay: clickDisplay,
//   };

// })();
