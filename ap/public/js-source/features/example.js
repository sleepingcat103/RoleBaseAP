var exampleController = (function() {
    
    let haveInit;
    
    // 初始化頁面動作
    function __init__() {

        // let $textarea = $('textarea')
        // $('#webUrl').on('click', e => {
        //     let data = $(e.currentTarget).parent().find('input').val();
        //     let selection = getInputSelection($textarea);
        //     console.log(data, selection);
        //     selectInputSection($textarea, { start: 1, end: 5 });
        //     $textarea.focus()
        // })
        // $('#fontColor').on('click', e => {
        //     let data = $(e.currentTarget).parent().find('input').val();
        //     let selection = getInputSelection($textarea);
        //     console.log(data, selection);
        //     selectInputSection($textarea, selection);
        // })
        // $('#answerPack').on('click', e => {
        //     let data = $(e.currentTarget).parent().find('input').val();
        //     console.log(data, getInputSelection($textarea));
        // })

        // $textarea.on('change keyup', e => {
        //     $('#preview').html($textarea.val())
        // })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        haveInit = true;
    }

    // private functions
    // function getInputSelection($elem) {
    //     if(typeof $elem != "undefined") {
    //         start = $elem[0].selectionStart;
    //         end = $elem[0].selectionEnd;

    //         return {
    //             selected: $elem.val().substring(start, end),
    //             start: $elem[0].selectionStart,
    //             end: $elem[0].selectionEnd
    //         }
    //     } else {
    //         return {};
    //     }
    // }

    // function selectInputSection($elem, config) {
    //     if(typeof $elem == "undefined") return;

    //     $elem[0].selectionStart = config.start;
    //     $elem[0].selectionEnd = config.end;
    // }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();