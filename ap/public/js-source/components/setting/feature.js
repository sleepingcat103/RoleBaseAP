(function() {
    
    let haveInit;
    let $featureList = $('#featureList');
    let $saveFeatureSort = $('#saveFeatureSort');
    let nowList;
    let edited = false;
    
    // 初始化頁面動作
    function __init__() {

        Sortable.create($featureList[0], {
            animation: 150,
            ghostClass: 'bg_green_light',
            onUpdate: sortableOnUpdateHandler,
        });

        $saveFeatureSort.on('click', e => {
            sortableOnUpdateHandler();
            if(!edited) return;

            let featuresSort = getList();
            $saveFeatureSort.attr('disabled', true);

            callBackendAPI('/sortFeature', 'POST', featuresSort)
            .then(response => {
                notify.success('變更成功，重新登入以看到你的變更');
                nowList = getList();
                edited = true;
            })
            .catch(error => {
                $saveFeatureSort.attr('disabled', false);
            })

        });

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {

        callBackendAPI('/listAllFeature', 'GET')
        .then(response => {
            let myHtml = response.map(feature => {
                return `
                    <div class="list-group-item py-1" featureId="${ feature.FEATURE_ID }">
                        <i class="fas fa-arrows-alt-v mr-3"></i> ${ feature.FEATURE_NAME } 
                    </div>`
            }).join('\n');

            $featureList.html(myHtml);
            nowList = getList();
        })
        .catch(error => {

        })

        // get data

        haveInit = true;
    }

    // private functions
    function getList() {
        return $featureList.find('.list-group-item').toArray().map(li => {
            return $(li).attr('featureId');
        })
    }

    // handler
    function sortableOnUpdateHandler(e) {
        let newList = getList();
        edited = !deepCompare(nowList, newList);

        if(edited) {
            $saveFeatureSort.attr('disabled', false);
        } else {
            $saveFeatureSort.attr('disabled', true);
        }
    }

    // do page init
    __init__();

    return {
        haveInit,
        edited,

        initPage,
    }

})();