const TYPES = (function () {
    function word(wordss) {
        let words = wordss;
        const word = {
            "output": {
                "answerID": "word",
                "style": "1",
                "generic": [
                    {
                        "response_type": "text",
                        "text": words
                    }]
            }
        }
        return word.output;
    }
    function w(style) {
        let s = style;
        const w = {
            "output": {
                "answerID": "w",
                "style": s,
                "generic": [
                    {
                        "response_type": "text",
                        "text": "若有鍵盤/滑鼠的問題，請來電至HelpDesk (#1600)協助您排除問題。"

                    }]
            }
        }
        return w.output;
    }
    function b(style) {
        let s = style;
        const b = {
            "output": {
                "answerID": "B",
                "style": s,
                "generic": [
                    {
                        "response_type": "option",
                        "title": "",
                        "DETAIL": "",
                        "options": [{
                            "label": "按鈕1",
                            "value": {
                                "input": {
                                    "type": "nextto",
                                    "text": "按鈕1",
                                    "value": "B1"
                                }
                            }
                        },
                        {
                            "label": "下載檔案",
                            "value": {
                                "input": {
                                    "type": "download",
                                    "text": "下載檔案",
                                    "value": "/data/授權申請單.pdf"
                                }
                            }
                        },
                        {
                            "label": "寄信",
                            "value": {
                                "input": {
                                    "type": "mailto",
                                    "text": "寄信",
                                    "value": {
                                        "mailName": "HelpdeskTeam@hotains.com.tw",
                                        "mailTitle": "",
                                        "mailBody": ""
                                    }
                                }
                            }

                        },
                        {
                            "label": "進入官網",
                            "value": {
                                "input": {
                                    "type": "url",
                                    "text": "進入官網",
                                    "value": "http://www.hotains.com.tw/"
                                }
                            }
                        }]
                    }]
            }
        }
        return b.output;
    }
    function wb() {
        const wb = {
            "output": {
                "answerID": "WB",
                "style": "2",
                "generic": [
                    {
                        "response_type": "text",
                        "text": "請問要詢問哪種問題呢?"
                    },
                    {
                        "response_type": "option",
                        "title": "",
                        "DETAIL": "",
                        "options": [{
                            "label": "帳號密碼",
                            "value": {
                                "input": {
                                    "type": "nextto",
                                    "text": "帳號密碼",
                                    "value": "Acc_01"
                                }
                            }
                        },
                        {
                            "label": "新人建立帳號",
                            "value": {
                                "input": {
                                    "type": "nextto",
                                    "text": "新人建立帳號",
                                    "value": "Acc_04"
                                }
                            }
                        }
                        ]
                    }]
            }
        }
        return wb.output;
    }
    function p(style) {
        let s = style
        const p = {
            "output": {
                "answerID": "P",
                "style": s,
                "generic": [
                    {
                        "title": "",
                        "source": "http://127.0.0.1:5500/public/img/PIC.png",
                        "response_type": "image"
                    }

                ]
            }
        }
        return p.output;
    }
    function wp() {
        const wp = {
            "output": {
                "answerID": "W+P",
                "style": "3",
                "generic": [
                    {
                        "response_type": "text",
                        "text": "若outlook回覆轉寄信件無法貼圖，請參閱下圖。"
                    },
                    {
                        "title": "",
                        "source": "http://127.0.0.1:5500/public/img/PIC.png",
                        "response_type": "image"
                    }

                ]
            }
        }
        return wp.output;
    }
    function wbp() {
        const wbp = {
            "output": {
                "answerID": "W+B+P",
                "style": "3",
                "generic": [
                    {
                        "response_type": "text",
                        "text": "若outlook回覆轉寄信件無法貼圖，請參閱下圖。"
                    },
                    {
                        "response_type": "option",
                        "title": "",
                        "DETAIL": "",
                        "options": [{
                            "label": "帳號密碼",
                            "value": {
                                "input": {
                                    "type": "nextto",
                                    "text": "帳號密碼",
                                    "value": "Acc_01"
                                }
                            }
                        },
                        {
                            "label": "新人建立帳號",
                            "value": {
                                "input": {
                                    "type": "nextto",
                                    "text": "新人建立帳號",
                                    "value": "Acc_04"
                                }
                            }
                        }
                        ]
                    },
                    {
                        "title": "",
                        "source": "http://127.0.0.1:5500/public/img/PIC.png",
                        "response_type": "image"
                    }

                ]
            }
        }
        return wbp.output;
    }
    function card() {
        const card = {
            "output": {
                "answerID": "card",
                "style": "2",
                "generic": [
                    {
                        "response_type": "card",
                        "card": {
                            "picSrc": "http://127.0.0.1:5500/public/img/PIC.png",
                            "title": "卡片",
                            "info": "這是卡片card"
                        }
                    }
                ]
            }
        }
        return card.output;
    }
    function slider() {
        const slider = {
            "output": {
                "answerID": "slider",
                "style": "2",
                "generic": [
                    {
                        "response_type": "slider",
                        "sliders": [
                            {
                                "picSrc": "http://127.0.0.1:5500/public/img/PIC.png",
                                "title": "slider1",
                                "info": "這是輪播slider1",
                                "button": [
                                    {
                                        "btnType": "nextto",
                                        "btnLabel": "按鈕",
                                        "btnText": "按鈕",
                                        "btnValue": "slider"
                                    },
                                    {
                                        "btnType": "nextto",
                                        "btnLabel": "按鈕",
                                        "btnText": "按鈕",
                                        "btnValue": "slider"
                                    }
                                ]
                            },
                            {
                                "picSrc": "http://127.0.0.1:5500/public/img/PIC.png",
                                "title": "slider2",
                                "info": "這是輪播slider2",
                                "button": [
                                    {
                                        "btnType": "nextto",
                                        "btnLabel": "按鈕",
                                        "btnText": "按鈕",
                                        "btnValue": "slider"
                                    },
                                    {
                                        "btnType": "nextto",
                                        "btnLabel": "按鈕",
                                        "btnText": "按鈕",
                                        "btnValue": "slider"
                                    }
                                ]
                            }]
                    }]
            }
        }
        return slider.output;
    }
    function suggestion() {
        const suggestion = {
            "output": {
                "style": "2",
                "generic": [
                    {
                        "response_type": "suggestion",
                        "suggestion": {
                            "title": "請問您想問的是?",
                            "information": "請選擇想要問的問題。",
                            "button": ""
                        }
                    }]
            }
        }
        return suggestion.output;
    }
    return {
        word: word,
        w: w,
        b: b,
        wb: wb,
        p: p,
        wp: wp,
        wbp: wbp,
        card: card,
        slider: slider,
        suggestion: suggestion
    };
})();