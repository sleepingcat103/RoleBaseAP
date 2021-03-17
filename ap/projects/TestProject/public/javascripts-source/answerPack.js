var answerPackController = (function() {
    
    let haveInit;
    let $tab = $('[tab="answerPack"]')
    let $answerpacksField = $tab.find('#answerpacksField');
    let $ansId = $tab.find('#ansId');
    let $style = $tab.find('#style');
    let $detail = $tab.find('#detail');
    let $ansName = $tab.find('#ansName');
    let $editArea = $tab.find('#editArea');

    let $previewBtn = $tab.find('#preview');
    let $clearBtn = $tab.find('#clear');
    let $logBtn = $tab.find('#log');
    let $createBtn = $tab.find('#create');
    let $saveBtn = $tab.find('#save');

    let $searchAnswerpackInput = $tab.find('#searchAnswerpackInput');
    let $searchAnswerpackBtn = $tab.find('#searchAnswerpack');
    let $changeLogSidebar = $tab.find('#changeLogSidebar');
    let $fileSystemSidebar = $tab.find('#fileSystemSidebar');
    
    let $searchParam = $changeLogSidebar.find('#searchParam');
    let $searchChangeLog = $changeLogSidebar.find('#searchChangeLog');
    let $accordionChangeLog = $changeLogSidebar.find('#accordionChangeLog');
    let $moreChangeLog = $changeLogSidebar.find('#moreChangeLog');

    let $fileUpload = $fileSystemSidebar.find('#fileUpload');
    let $documentFiles = $fileSystemSidebar.find('[content="documentFiles"]');
    let $mediaFiles = $fileSystemSidebar.find('[content="mediaFiles"]');
    
    // 初始化頁面動作
    function __init__() {

        $changeLogSidebar.find('#startDt, #endDt').datepicker({
            format: "yyyy/mm/dd",
            autoclose: true,
            calendarWeeks: true,
            todayHighlight: true,
            language: 'zh-TW'
        })

        // 清除
        $clearBtn.on('click', e => {
            confirmAndClear();
        })
        // 預覽
        $previewBtn.on('click', e => {
            let { output } = getDbInformation();
            mainController.preview(output)
        })
        // 新增答案包
        // $createBtn.on('click', e => {
        //     let $target = $(e.currentTarget);
        //     let ansId = $ansId.val()

        //     if(!ansId) { notify.danger('請填寫答案包ID'); return; }
        //     if($editArea.contents().length == 0) { notify.danger('答案包內沒有回覆'); return; }

        //     let body = {
        //         projectId: mainController.getProjectId(),
        //         ansId,
        //         information: JSON.stringify(getDbInformation()),
        //         detail: $detail.val(),
        //         ansName: $ansName.val(),
        //     }

        //     $target.attr('disabled', true);
        //     callBackendAPI('/insertAnswerpack', 'POST', body)
        //     .then(response => {
        //         notify.success('新增答案包成功')
        //         $answerpacksField.append(buildAnswerpackButtons({ ANSWER_ID: body.ansId, DETAIL: body.detail }));
        //     })
        //     .catch(error => {
        //         notify.danger('新增答案包失敗')
        //     })
        //     .finally(() => {
        //         $target.attr('disabled', false);
        //     })

        // })
        // 儲存編輯
        $saveBtn.on('click', e => {
            let $target = $(e.currentTarget);
            let ansId = $ansId.val()
            let ansIds = $answerpacksField.find('div[content="answerpack"]').toArray().map(obj => {
                return $(obj).text().trim();
            })

            if(!ansId) { notify.danger('請填寫答案包ID'); return; }
            if($editArea.contents().length == 0) { notify.danger('答案包內沒有回覆'); return; }

            let body = {
                projectId: mainController.getProjectId(),
                ansId,
                information: JSON.stringify(getDbInformation()),
                detail: $detail.val(),
                ansName: $ansName.val(),
            }

            // 現有ID 走編輯流程
            if(ansIds.indexOf(ansId) > -1) {
                if(!confirm(`目前已經有 ${ ansId } 的答案包，確認要覆蓋嗎?`)) return;

                $target.attr('disabled', true);

                callBackendAPI('/updateAnswerpack', 'POST', body)
                .then(response => {
                    notify.success('編輯答案包成功')
                })
                .catch(error => {
                    notify.danger('編輯答案包失敗')
                })
                .finally(() => {
                    $target.attr('disabled', false);
                })

            // 新的ID 走新增流程
            } else {
                if(!confirm(`確定要新增答案包 ${ ansId } 嗎?`)) return;
    
                $target.attr('disabled', true);
                callBackendAPI('/insertAnswerpack', 'POST', body)
                .then(response => {
                    notify.success('新增答案包成功')
                    $answerpacksField.append(buildAnswerpackButtons({ ANSWER_ID: body.ansId, DETAIL: body.detail }));
                })
                .catch(error => {
                    notify.danger('新增答案包失敗')
                })
                .finally(() => {
                    $target.attr('disabled', false);
                })
            }
        })
        
        $logBtn.on('click', e => {
            $changeLogSidebar.toggleClass('active');
        })

        // 搜尋變更紀錄
        $searchChangeLog.on('click', e => {
            searchChangeLog()
        })
        $moreChangeLog.on('click', e => {
            let body = JSON.parse($searchParam.val());
            searchChangeLog(body)
        })

        // 放入編輯區
        $changeLogSidebar.on('click', '[action="setEditArea"]', e => {
            if(!confirmAndClear()) return;

            let content = $(e.currentTarget).parent().find('pre').html();
            $changeLogSidebar.toggleClass('active');

            setEditArea(JSON.parse(content));
        })

        // 搜尋答案包ID
        $searchAnswerpackInput.on('change input keyup', e => {
            let text = $(e.currentTarget).val();
            if(text == '') {
                $answerpacksField.find('[content="answerpack"]').show();
            } else {
                $answerpacksField.find('[content="answerpack"]').toArray().forEach(btn => {
                    let btnText = $(btn).text().trim();
                    if(btnText.toUpperCase().indexOf(text.toUpperCase()) > -1) {
                        $(btn).show();
                    } else {
                        $(btn).hide();
                    }
                })
            }
        })
        // 搜尋答案包內文
        $searchAnswerpackBtn.on('click', e => {
            let $target = $(e.currentTarget);
            let pattern = $searchAnswerpackInput.val();
            if(!pattern) return;

            let body = {
                projectId: mainController.getProjectId(),
                pattern: pattern
            }

            $target.attr('disabled', true);
            callBackendAPI('/findAnswerpack', 'POST', body)
            .then(response => {
                if(!response || response.lecgth == 0) {
                    $answerpacksField.find('[content="answerpack"]').hide();
                } else {
                    $answerpacksField.find('[content="answerpack"]').toArray().forEach(btn => {
                        let buttonText = $(btn).text().trim();
                        if(response.find(ansPack => buttonText == ansPack.ANSWER_ID)) {
                            $(btn).show();
                        } else {
                            $(btn).hide();
                        }
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
        })

        // 選擇答案包，開始編輯
        $answerpacksField.on('click', '[action="show"]', e => {
            if(e.target != e.currentTarget) return;

            let $target = $(e.currentTarget);
            let ansId = $target.text().trim();
                
            if(!ansId) return;
            if(!confirmAndClear()) return;

            showAnswerpack(ansId);

            function showAnswerpack(ansId) {
                if(!confirmAndClear()) return;
                let body = {
                    projectId: mainController.getProjectId(),
                    ansId: ansId
                }
                
                callBackendAPI('/getAnswerpack', 'POST', body)
                .then(response => {
                    setEditArea(response);
                    notify.success('取得資料成功')
                })
                .catch(error => {
                    console.error(error);
                    notify.danger('取得資料失敗');
                })
                
            }
        })
        $answerpacksField.on('click', '[action="delete"]', e => {

            let $target = $(e.currentTarget).parent();
            let ansId = $target.text().trim();
                
            if(!ansId) return;

            deleteAnswerpack(ansId);

            function deleteAnswerpack(ansId) {
                if(confirm(`確認要刪除答案包 ${ ansId } ，此動作無法復原`)) {
                    let body = {
                        projectId: mainController.getProjectId(),
                        ansId: ansId
                    }
                    callBackendAPI('/deleteAnswerpack', 'POST', body)
                    .then(res => {
                        $target.remove();
                        notify.success('刪除成功');
                    })
                    .catch(error => {
                        notify.danger('刪除失敗');
                    })
                }
            }
        })

        // 增加板塊(所有)
        $tab.find('#add_card_buttons').on('click', 'button', e => {
            let target = $(e.currentTarget).attr('target');
            generateBlocks(target);
        })
        
        // 上移板塊
        $editArea.on('click', '.move-up-card', function(e) {
            let $card = $(e.currentTarget).closest('.card');
            moveBlock($card);
            checkAfterInsertBlock($card.parent());
        })
        // 移除板塊
        $editArea.on('click', '.remove-card', function(e) {
            let $card = $(e.currentTarget).closest('.card');
            let $parent = $card.parent();
            $card.remove()
            
            checkAfterInsertBlock($parent);
        })
        // 增加子板塊
        $editArea.on('click', '[action="addSubCard"]', function(e) {
            console.log(e)
            let $target = $(e.currentTarget);
            let targetCard = $target.attr('target');
            let newCard = (() => {
                switch(targetCard) {
                    case 'button': return generateButtonBlock();
                    case 'card': return generateCardBlock();
                    default: return '';
                }
            })();

            $(e.currentTarget).before(newCard);
            checkAfterInsertBlock($target.parent());
        })

        // 按鈕動作選到寄出信件時，變成他專屬的value欄位
        $editArea.on('change', '.card[type="button"] select[content="button_block_type"]', e => {
            let $target = $(e.currentTarget);
            let $container = $target.closest('.card-body');

            if($target.val() == 'mailto') {
                $container.find('[field="value-normal"]').hide();
                $container.find('[field="value-mailto"]').show();
            } else {
                $container.find('[field="value-normal"]').show();
                $container.find('[field="value-mailto"]').hide();

                if($target.val() == 'download') {
                    $container.find('[field="value-download"]').show();
                } else {
                    $container.find('[field="value-download"]').hide();
                }
            }
        })
        // 選擇檔案
        $editArea.on('click', '[field="value-download"] button', e => {
            $fileSystemSidebar.toggleClass('active');
            $fileSystemSidebar.attr('targetCardId', $(e.currentTarget).closest('.card').attr('id'));
            $fileSystemSidebar.attr('targetContent', $(e.currentTarget).closest('.input-group').find('input').attr('content'));
        })
        // 上傳檔案
        $fileUpload.on('click', e => {
            let file = $fileSystemSidebar.find('[name="uploadFile"]')[0].files[0];
            if(!file) return;

            let fileNameSplit = file.name.split('.');
            let extension = fileNameSplit.length > 1 ? fileNameSplit[fileNameSplit.length - 1] : '';
            extension = extension.toLowerCase();

            let fileType = (() => {
                let documents = [ 'pdf' ];
                let medias = [ 'png', 'jpg', 'jpeg', 'gif' ]; 

                if(documents.indexOf(extension) > -1) {
                    return 'document'
                } else if (medias.indexOf(extension) > -1) {
                    return 'image'
                } else {
                    return '';
                }
            })();

            if(!fileType) {
                notify.danger('不接受的檔案類型');
                return;
            }

            let formData = new FormData();
            formData.append('uploadFile', file);
            formData.append('projectId', mainController.getProjectId());
            formData.append('fileType', fileType);

            callBackendAPI_Multipart('/uploadFile', 'POST', formData)
            .then(response => {
                notify.success('上傳成功');
                
                // 重整資料區
                if(fileType == 'document') loadDocuments()
                if(fileType == 'media') loadMedias()
            })
            .catch(error => {
                console.error(error)
                notify.danger('上傳失敗');
            })

        })
        // 重整檔案列表
        $documentFiles.on('click', 'button[action="reload"]', e => {
            loadDocuments();
        })
        $mediaFiles.on('click', 'button[action="reload"]', e => {
            loadMedias();
        })
        // 選用檔案
        $fileSystemSidebar.on('click', '[action="selectFile"]', e => {
            let filePath = $(e.currentTarget).attr('filePath');
            let targetCardId = $fileSystemSidebar.attr('targetCardId');
            let targetContent = $fileSystemSidebar.attr('targetContent');
            $('#' + targetCardId).find('.card-body').first().find(`[content="${ targetContent }"]`).val(filePath);

            $fileSystemSidebar.toggleClass('active')
        })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        
        let projectId = mainController.getProjectId();
        let body = { projectId };

        let maskId = stableMask('資料載入中<div class="loadind"></div>');
        callBackendAPI('/listAnswerpack', 'POST', body)
        .then(response => {
            $answerpacksField.html(response.map(answerpack => {
                return buildAnswerpackButtons(answerpack);
            }).join(''))
        })
        .then(() => {
            let ansId = $searchAnswerpackInput.val();
            let target = $answerpacksField.find('button').toArray().find(btn => {
                if(ansId == $(btn).text().trim()) return true;
            })
            if(target) $(target).trigger('click');
            $searchAnswerpackInput.trigger('change');

            // 載入文件清單
            loadDocuments();
            loadMedias();
            
            haveInit = true;
        })
        .catch(error => {
            console.error(error);
            notify.danger('資料載入失敗，請洽管理人員');
        })
        .finally(() => {
            removeMask(maskId);
        })
    }

    // private functions
    function searchChangeLog(body) {
        let endDt = $changeLogSidebar.find('#endDt').val();
        body = body || {
            projectId: mainController.getProjectId(),
            startDt: $changeLogSidebar.find('#startDt').val(),
            endDt: endDt ? dayjs(endDt).add(1, 'day').format('YYYY/MM/DD') : endDt,
            userId: $changeLogSidebar.find('#userId').val(),
            target: $changeLogSidebar.find('#ansId').val(),
            type: 'answerpack',
        }

        $searchChangeLog.attr('disabled', true);
        $accordionChangeLog.html('');
        $searchParam.val('');

        callBackendAPI('/filterTrace', 'POST', body)
        .then((response) => {
            let myHtml = response.map(trace => {
                let badge = trace.ACTION == 'update' ? '<span class="badge badge-pill badge-info mr-1"><i class="fas fa-pen"></i> 編輯</span>' : 
                            trace.ACTION == 'insert' ? '<span class="badge badge-pill badge-success mr-1"><i class="fas fa-plus"></i> 新增</span>' :
                            trace.ACTION == 'delete' ? '<span class="badge badge-pill badge-danger mr-1"><i class="fas fa-trash-alt"></i> 刪除</span>' : '';
                
                return `
                <div class="card">
                    <div class="card-header px-0 py-0">
                        <h2 class="mb-0">
                            <button class="btn btn-block d-flex justify-content-between px-3" type="button" data-toggle="collapse" data-target="#collapse${ trace.ID }">
                                <div>
                                    ${ badge } ${ trace.TARGET }
                                </div>
                                <span>${ localeTimeTW(trace.CREATE_TIME) }</span>
                            </button>
                        </h2>
                    </div>
                    <div id="collapse${ trace.ID }" class="collapse" data-parent="#accordionChangeLog">
                        <div class="card-body p-0">
                            <div class="mx-3 my-2">
                                <div>編輯人: ${ trace.USER_ID }</div>
                                <div class="mt-2">
                                    編輯前: <a href="#" action="setEditArea">🡸放入編輯區</a>
                                    <pre class="bg_grey_lighter rounded px-2 py-1 mb-0">${ trace.OLD_DATA ? JSON.stringify(JSON.parse(trace.OLD_DATA), null, 2) : '' }</pre>
                                </div>
                                <div class="mt-2">
                                    編輯後: <a href="#" action="setEditArea">🡸放入編輯區</a>
                                    <pre class="bg_grey_lighter rounded px-2 py-1 mb-0">${ trace.NEW_DATA ? JSON.stringify(JSON.parse(trace.NEW_DATA), null, 2) : '' }</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
            })
            $accordionChangeLog.append(myHtml);

            if(response.length == mainController.pageLimit) {
                $moreChangeLog.show();
            } else {
                body.offset += mainController.pageLimit;
                $searchParam.val(JSON.stringify(body));
                $moreChangeLog.hide();
            }
        })
        .catch(error => { console.error(error); })
        .finally(() => { $searchChangeLog.attr('disabled', false); });
    }
    function setEditArea(row) {
        
        $ansId.val(row.ANSWER_ID);
        $detail.val(row.DETAIL);
        $ansName.val(row.ANS_NAME);
        let answerPack = JSON.parse(row.INFORMATION);
        
        $style.val(answerPack.output.style);

        answerPack.output.generic.forEach(message => {
            // console.log(message);
            generateBlocks(message.response_type, message);
        })
    }

    // 載入檔案列表
    function loadDocuments() {
        let body = {
            projectId: mainController.getProjectId(),
            fileType: 'document'
        }
        $documentFiles.find('ol').html('');

        callBackendAPI('/listFiles', 'POST', body)
        .then(response => {
            let myHtml = response.result.map(file => {
                return `
                <li>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-info" action="selectFile" filePath="${ file.filePath }">
                            <i class="fas fa-check"></i>
                        </button>
                        ${ file.fileName }
                    </div>
                </li>`;
            })
            $documentFiles.find('ol').html(myHtml);
        })
        .catch(error => {
            console.error(error)
        })
    }
    function loadMedias() {
        let body = {
            projectId: mainController.getProjectId(),
            fileType: 'image'
        }
        $mediaFiles.find('ol').html('');

        callBackendAPI('/listFiles', 'POST', body)
        .then(response => {
            let myHtml = response.result.map(file => {
                return `
                <li>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-info" action="selectFile" filePath="${ file.filePath }">
                            <i class="fas fa-check"></i>
                        </button>
                        ${ file.fileName }
                    </div>
                </li>`;
            })
            $mediaFiles.find('ol').html(myHtml);
        })
        .catch(error => {
            console.error(error)
        })
    }
    
    function cardId() {
        return 'card-' + uuid();
    }

    function generateBlocks(type, msg) {
        let newCard = (() => {
            switch(type) {
                // 基本
                case 'text': return generateTextBlock(msg);
                case 'option': return generateOptionBlock(msg);
                case 'image': return generateImageBlock(msg);
                // 進階
                case 'card': return generateCardBlock(msg);
                case 'slider': return generateSliderBlock(msg);
                // 複合
                case 'wb': return generateTextBlock() + generateOptionBlock();
                case 'wp': return generateTextBlock() + generateImageBlock();
                case 'wpb': return generateTextBlock() + generateImageBlock() + generateOptionBlock();

                default: return '';
            }
        })();
        $editArea.append(newCard);
        checkAfterInsertBlock($editArea);
    }

    function generateTextBlock(msg) {
        msg = msg || {
            // "response_type": "text",
            "text": ""
        }
        let _cardId = cardId();

        return `<div class="card shadow-sm mb-2" type="text" id="${ _cardId }">
            <div class="card-header bg_blue_light  py-2 px-3">
                <div class="d-flex justify-content-between align-items-center">
                    <a class="card-title mb-0" data-toggle="collapse" data-target="#collapse-${ _cardId }">文字</a>
                    <div>
                        <a class="btn-link move-up-card" style="display: none;"><i class="fas fa-arrow-up fa-fw mr-2"></i></a>
                        <a class="btn-link remove-card"><i class="fas fa-times fa-fw"></i></a>
                    </div>
                </div>
            </div>
            <div id="collapse-${ _cardId }" class="collapse show">
                <div class="card-body">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">訊息內容</span>
                        </div>
                        <textarea content="text_block_text" class="form-control col" rows="2">${ msg.text || '' }</textarea>
                    </div>
                </div>
            </div>
        </div>`;
    }
    function generateImageBlock(msg) {
        msg = msg || {
            // "response_type": "image",
            "title": "",
            "source": "",
        }
        let _cardId = cardId();

        return `<div class="card shadow-sm mb-2" type="image" id="${ _cardId }">
            <div class="card-header bg_blue_light  py-2 px-3">
                <div class="d-flex justify-content-between align-items-center">
                    <a class="card-title mb-0" data-toggle="collapse" data-target="#collapse-${ _cardId }">圖片</a>
                    <div>
                        <a class="btn-link move-up-card" style="display: none;"><i class="fas fa-arrow-up fa-fw mr-2"></i></a>
                        <a class="btn-link remove-card"><i class="fas fa-times fa-fw"></i></a>
                    </div>
                </div>
            </div>
            <div id="collapse-${ _cardId }" class="collapse show">
                <div class="card-body">
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">圖片文字</span>
                        </div>
                        <input content="image_block_title" type="text" class="form-control col" placeholder="" value="${ msg.title || '' }">
                    </div>
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">圖片位址</span>
                        </div>
                        <input content="image_block_source" type="text" class="form-control col" placeholder="" value="${ msg.source || '' }">
                    </div>
                </div>
            </div>
        </div>`;
    }
    function generateOptionBlock(msg) {
        msg = msg || {
            // "response_type": "option",
            "title": "",
            "DETAIL": "",
            "button": [ undefined ]
        }
        let _cardId = cardId();

        return `<div class="card shadow-sm mb-2" type="option" id="${ _cardId }">
            <div class="card-header bg_blue_light  py-2 px-3">
                <div class="d-flex justify-content-between align-items-center">
                    <a class="card-title mb-0" data-toggle="collapse" data-target="#collapse-${ _cardId }">選項</a>
                    <div>
                        <a class="btn-link move-up-card" style="display: none;"><i class="fas fa-arrow-up fa-fw mr-2"></i></a>
                        <a class="btn-link remove-card"><i class="fas fa-times fa-fw"></i></a>
                    </div>
                </div>
            </div>
            <div id="collapse-${ _cardId }" class="collapse show">
                <div class="card-body">
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">選項標題</span>
                        </div>
                        <input content="option_block_title" type="text" class="form-control col" placeholder="" value="${ msg.title || '' }">
                    </div>
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">選項敘述</span>
                        </div>
                        <input content="option_block_detail" type="text" class="form-control col" placeholder="" value="${ msg.DETAIL || '' }">
                    </div>
                    ${ msg.button.map(btn => {
                        return generateButtonBlock(btn);
                    }).join('') }
                    <button type="button" class="btn btn-block btn-sm btn_outline_blue bg_white" action="addSubCard" target="button">新增按鈕</button>
                </div>
            </div>
        </div>`;
    
    }
    function generateCardBlock(msg) {
        msg = msg || {
            // "response_type": "card",
            "card": {
                "picSrc": "",
                "title": "",
                "info": "",
                "button": [ undefined ]
            }
        }
        let _cardId = cardId();

        return `<div class="card shadow-sm mb-2" type="card" id="${ _cardId }">
            <div class="card-header bg_blue_light  py-2 px-3">
                <div class="d-flex justify-content-between align-items-center">
                    <a class="card-title mb-0" data-toggle="collapse" data-target="#collapse-${ _cardId }">一覽</a>
                    <div>
                        <a class="btn-link move-up-card" style="display: none;"><i class="fas fa-arrow-up fa-fw mr-2"></i></a>
                        <a class="btn-link remove-card"><i class="fas fa-times fa-fw"></i></a>
                    </div>
                </div>
            </div>
            <div id="collapse-${ _cardId }" class="collapse show">
                <div class="card-body">
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">圖片位址</span>
                        </div>
                        <input content="card_block_picSrc" type="text" class="form-control col" placeholder="" value="${ msg.card.picSrc || '' }">
                    </div>
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">一覽標題</span>
                        </div>
                        <input content="card_block_title" type="text" class="form-control col" placeholder="" value="${ msg.card.title || '' }">
                    </div>
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">一覽敘述</span>
                        </div>
                        <input content="card_block_info" type="text" class="form-control col" placeholder="" value="${ msg.card.info || '' }">
                    </div>
                    ${ msg.card.button.map(btn => {
                        return generateButtonBlock(btn);
                    }).join('') }
                    <button type="button" class="btn btn-block btn-sm btn_outline_blue bg_white" action="addSubCard" target="button">新增按鈕</button>
                </div>
            </div>
        </div>`;
    }
    function generateSliderBlock(msg) {
        msg = msg || {
            // "response_type": "slider",
            "sliders": [ undefined ] // put cards
        }

        let _cardId = cardId();

        return `<div class="card shadow-sm mb-2" type="slider" id="${ _cardId }">
            <div class="card-header bg_blue_light  py-2 px-3">
                <div class="d-flex justify-content-between align-items-center">
                    <a class="card-title mb-0" data-toggle="collapse" data-target="#collapse-${ _cardId }">輪播</a>
                    <div>
                        <a class="btn-link move-up-card" style="display: none;"><i class="fas fa-arrow-up fa-fw mr-2"></i></a>
                        <a class="btn-link remove-card"><i class="fas fa-times fa-fw"></i></a>
                    </div>
                </div>
            </div>
            <div id="collapse-${ _cardId }" class="collapse show">
                <div class="card-body">
                    ${ msg.sliders.map(slider => {
                        return generateCardBlock(slider ? { card: slider } : slider);
                    }).join('') }
                    <button type="button" class="btn btn-block btn-sm btn_outline_blue bg_white" action="addSubCard" target="card">新增輪播板塊</button>
                </div>
            </div>
        </div>`;
    }
    // subcard: card in cards
    function generateButtonBlock(action) {
        let msg = action || {
            "btnType": "nextto", //nextto, url, download, mailto
            "btnLabel": "",
            "btnText": "",
            "btnValue": ""
        }
        
        // when type = "mailto", value became
        // {
        //     "mailName": "",
        //     "mailTitle": "",
        //     "mailBody": ""
        // }

        let type = msg.btnType || 'nextto';
        let _cardId = cardId();

        return `<div class="card shadow-sm mb-2" type="button" id="${ _cardId }">
            <div class="card-header bg_blue_light  py-2 px-3">
                <div class="d-flex justify-content-between align-items-center">
                    <a class="card-title mb-0" data-toggle="collapse" data-target="#collapse-${ _cardId }">按鈕</a>
                    <div>
                        <a class="btn-link move-up-card" style="display: none;"><i class="fas fa-arrow-up fa-fw mr-2"></i></a>
                        <a class="btn-link remove-card"><i class="fas fa-times fa-fw"></i></a>
                    </div>
                </div>
            </div>
            <div id="collapse-${ _cardId }" class="collapse show">
                <div class="card-body">
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">按鈕文字</span>
                        </div>
                        <input content="button_block_label" type="text" class="form-control col" placeholder="" value="${ msg.btnLabel || '' }">
                    </div>
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">按下發話</span>
                        </div>
                        <input content="button_block_text" type="text" class="form-control col" placeholder="" value="${ msg.btnText || '' }">
                    </div>
                    <div class="input-group input-group-sm mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text">按鈕動作</span>
                        </div>
                        <select class="custom-select" content="button_block_type">
                            <option value="nextto" ${ type == 'nextto' ? 'selected' : '' }>到答案包</option>
                            <option value="url" ${ type == 'url' ? 'selected' : '' }>打開網頁</option>
                            <option value="download" ${ type == 'download' ? 'selected' : '' }>下載檔案</option>
                            <option value="mailto" ${ type == 'mailto' ? 'selected' : '' }>寄出信件</option>
                        </select>
                    </div>
                    <div field="value-normal" ${ type == 'mailto' ? 'style="display: none;"' : '' }>
                        <div class="input-group input-group-sm mb-2">
                            <div class="input-group-prepend">
                                <span class="input-group-text">值</span>
                            </div>
                            <input content="button_block_value" type="text" class="form-control col" placeholder="" value="${ msg.btnValue || '' }">
                            <div class="input-group-append" field="value-download" ${ type == 'download' ? '' : 'style="display: none;"' }>
                                <button class="btn btn-outline-secondary" type="button">瀏覽</button>
                            </div>
                        </div>
                    </div>
                    <div field="value-mailto" ${ type == 'mailto' ? '' : 'style="display: none;"' }>
                        <div class="border-top mb-2"></div>
                        <div class="input-group input-group-sm mb-2">
                            <div class="input-group-prepend">
                                <span class="input-group-text">發送對象</span>
                            </div>
                            <input content="button_block_mail_name" type="text" class="form-control col" placeholder="" value="${ msg.mailName || '' }">
                        </div>
                        <div class="input-group input-group-sm mb-2">
                            <div class="input-group-prepend">
                                <span class="input-group-text">信件標題</span>
                            </div>
                            <input content="button_block_mail_title" type="text" class="form-control col" placeholder="" value="${ msg.mailTitle || '' }">
                        </div>
                        <div class="input-group input-group-sm mb-2">
                            <div class="input-group-prepend">
                                <span class="input-group-text">信件內文</span>
                            </div>
                            <input content="button_block_mail_body" type="text" class="form-control col" placeholder="" value="${ msg.mailBody || '' }">
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function buildAnswerpackButtons(answerpack) {
        return `
            <div content="answerpack" action="show" class="btn btn-sm btn-light border mb-2" ansId="${ answerpack.ANSWER_ID }" title="${ answerpack.DETAIL }">
                ${ answerpack.ANSWER_ID }
                <span action="delete" class="badge btn-outline-danger border"><i class="fas fa-times"></i></span>
            </div>`;
    }
    
    // 板塊上移
    function moveBlock($card) {
        let $parent = $card.parent();
        $card.prev().before($card);
        
        checkAfterInsertBlock($parent);
    }
    // 移動後檢查移動按鈕是否應該存在
    function checkAfterInsertBlock($parent) {
        let cards = $parent.children('.card').toArray();
        // let subcards = $parent.children('.card').toArray();
        
        cards.forEach(function(card, index) {
            if(cards.length == 1) {
                $(card).children('.card-header bg_blue_light ').find('.move-up-card').hide();
                // $(card).children('.card-header bg_blue_light ').find('.remove-card').hide();
            } else if(index == 0) {
                $(card).children('.card-header bg_blue_light ').find('.move-up-card').hide();
                // $(card).children('.card-header bg_blue_light ').find('.remove-card').show();
            } else {
                $(card).children('.card-header bg_blue_light ').find('.move-up-card').show();
                // $(card).children('.card-header bg_blue_light ').find('.remove-card').show();
            }
        })
    
        // 編號 
        // if(subcards.length > 0){
        //     if($(subcards).attr('type') == 'button_sub_card'){
        //         $(subcards).children('.card-header bg_blue_light ').children('div').children('.card-title')
        //             .toArray().forEach(function(title, index) {
        //                 $(title).html('按鈕 ' + ( index+1 ))
        //             });
        //     }
        //     if($(subcards).attr('type') == 'carousel_tab_sub_card'){
        //         $(subcards).children('.card-header bg_blue_light ').children('div').children('.card-title')
        //             .toArray().forEach(function(title, index) {
        //                 $(title).html('板塊 ' + ( index+1 ))
        //             });
        //     }
        //     if($(subcards).attr('type') == 'image_carousel_tab_sub_card'){
        //         $(subcards).children('.card-header bg_blue_light ').children('div').children('.card-title')
        //             .toArray().forEach(function(title, index) {
        //                 $(title).html('圖板 ' + ( index+1 ))
        //             });
        //     }
        // }
    
        // 重畫目錄
        // $('#navbar').html(drawIndex($editArea.children('.card').toArray()));
    }

    // 取得記錄進DB的格式
    function getDbInformation() {
        return {
            "output": {
                "answerID": $ansId.val().toString(),
                "style" : $style.val().toString(),
                "generic": getMessageJson()
            }
        }
    }

    // 取得訊息json
    function getMessageJson() {
        return $editArea.children('.card').toArray().map(block => {
            let response_type = $(block).attr('type');
            return Object.assign({ response_type }, parseMessaages(response_type, $(block)));
        })

        function parseMessaages(response_type, $block) {
            let $content = $block.find('.card-body').first();
            let message;

            if(response_type == 'text') {
                message = {
                    "text": $content.find('[content="text_block_text"]').val()
                }
            } else if(response_type == 'option') {
                message = {
                    "title": $content.find('[content="option_block_title"]').val(),
                    "DETAIL": $content.find('[content="option_block_detail"]').val(),
                    "button": $content.children('.card[type="button"]').toArray().map(b => {
                        return parseMessaages('button', $(b));
                    })
                }
            } else if(response_type == 'image') {
                message = {
                    "title": $content.find('[content="image_block_title"]').val(),
                    "source": $content.find('[content="image_block_source"]').val(),
                }
            } else if(response_type == 'card') {
                message = {
                    "card": {
                        "picSrc": $content.find('[content="card_block_picSrc"]').val(),
                        "title": $content.find('[content="card_block_title"]').val(),
                        "info": $content.find('[content="card_block_info"]').val(),
                        "button": $content.children('.card[type="button"]').toArray().map(b => {
                            return parseMessaages('button', $(b));
                        })
                    }
                }
            } else if(response_type == 'slider') {
                message = {
                    "sliders": $content.children('.card[type="card"]').toArray().map(b => {
                        return parseMessaages('card', $(b));
                    }).map(msg => { return msg.card })
                }
            } else if(response_type == 'button') {
                let btnType = $content.find('[content="button_block_type"]').val()
                message = {
                    "btnType": btnType,
                    "btnLabel": $content.find('[content="button_block_label"]').val(),
                    "btnText": $content.find('[content="button_block_text"]').val(),
                    "btnValue": (() => {
                        if(btnType == "mailto") {
                            return {
                                "mailName": $content.find('[content="button_block_mail_name"]').val(),
                                "mailTitle": $content.find('[content="button_block_mail_title"]').val(),
                                "mailBody": $content.find('[content="button_block_mail_body"]').val()
                            }
                        } else {
                            return $content.find('[content="button_block_value"]').val()
                        }
                    })()
                }
            }

            return message;
        }
    }
    // 防呆 確認清除當前編輯內容
    function confirmAndClear() {
        let msg = "是否放棄編輯中的內容";
        let result = $editArea.contents().length == 0 || confirm(msg);
        if(result) {
            $editArea.html('');
            $ansId.val('');
            $style.val('1');
            $detail.val('');
            $ansName.val('');
            $editArea.val('');
        }
        return result;
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();