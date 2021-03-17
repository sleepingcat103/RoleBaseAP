var watsonTrainingController = (function() {
    
    let haveInit;
    let context = {};
    let workspace;
    let selectIntent, selectEntity, selectValue;

    let $tab = $('[tab="watsonTraining"]');
    let $intentEditor = $tab.find('.training_list[content="intent"]');
    let $entityEditor = $tab.find('.training_list[content="entity"]');
    let $intentSelector = $intentEditor.find('#intent_selector');
    let $entitySelector = $entityEditor.find('#entity_selector');
    let $intentContent = $intentEditor.find('.training_list_body[content="examples"]');
    let $entityContent = $entityEditor.find('.training_list_body[content="values"]');

    let $addIntentEntitySidebar = $tab.find('#addIntentEntity');
    let $editValueAndSynonymsSidebar = $tab.find('#editValueAndSynonyms');
    let $importDataSidebar = $tab.find('#importData');
    
    
    // 初始化頁面動作
    function __init__() {

        // intent list
		$intentSelector.on('change', e => {
			let target = $(e.target).val();

			if(!target) return;
			$intentContent.html('');

            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ intent: target }, response);
                return callWatsonAPI('/listExamples', 'POST', body);
            })
            .then(response => {
                let data = response.result;
				$intentContent.html(generateExampleAdder() + 
                    (data.examples.map(example => generateExampleList(example)) || []).join('\n'));
                    
				selectIntent = target;
			}).catch(error => { console.log(error) });
		});
		$intentEditor.on('click', '#intent_add', e => {
			$addIntentEntitySidebar.toggleClass('active');
			$addIntentEntitySidebar.find('#new_intent').show();
			$addIntentEntitySidebar.find('#new_entity').hide();
			$addIntentEntitySidebar.find('#submit_add_intent').show();
			$addIntentEntitySidebar.find('#submit_add_entity').hide();
		});
		$addIntentEntitySidebar.on('click', '#submit_add_intent', e => {
			let $target = $(e.currentTarget);
			let newIntent = $('#new_intent_input').val().trim()
            
            if(!newIntent) return;

            $target.attr('disabled', false);
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ intent: newIntent }, response);
                return callWatsonAPI('/createIntent', 'POST', body);
            })
			.then(response => {
				$intentSelector[0].selectize.addOption({ value: newIntent, text: newIntent });
				$intentSelector[0].selectize.refreshOptions(false);
				$intentSelector[0].selectize.setValue(newIntent, false);
				$addIntentEntitySidebar.toggleClass('active');
                notify.success('新增意圖成功');
			})	
			.catch(error => {
                notify.danger('新增意圖失敗');
			})
            .finally(() => {
                $target.attr('disabled', false);
            })
		});
		$intentEditor.on('click', '#intent_name_edit', e => {
			if(!selectIntent) return;

			let $parent = $(e.currentTarget).parent().parent().parent();
			$('#intent_name_input').val(selectIntent);
			$parent.children('div').toggleClass('d-none');
		});
		$intentEditor.on('click', '#intent_name_submit', e => {
			let newInentName = $('#intent_name_input').val().trim();
			let $parent = $(e.currentTarget).parent().parent().parent();

			if(!newInentName) return;

            mainController.getAssistantConfig()
            .then(response => {
                if(selectIntent == newInentName) return Promise.resolve();

                let body = Object.assign({ intent: selectIntent, newIntent: newInentName }, response);
                return callWatsonAPI('/updateIntent', 'POST', body);
            })
			.then(response => {
				$intentSelector[0].selectize.updateOption(selectIntent, { value: newInentName, text: newInentName });
				$intentSelector[0].selectize.refreshOptions(false);
				$intentSelector[0].selectize.setValue(newInentName, true);
				selectIntent = newInentName;

				$parent.children('div').toggleClass('d-none');
                notify.success('修改意圖名稱成功');
			})	
			.catch(error => {
                notify.danger('修改意圖名稱失敗');
			})
		});
		$intentEditor.on('click', '#intent_name_cancel', e => {
			let $parent = $(e.currentTarget).parent().parent().parent();
			$parent.children('div').toggleClass('d-none');
			$('#intent_name_input').val(selectIntent);
		});
		$intentEditor.on('click', '#intent_remove', e => {

			if(!selectIntent) return;

			if (confirm("即將刪除該Intent，確定要刪除?")) {
    			//
			} else {
				return;
			}
			
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ intent: selectIntent }, response);
                return callWatsonAPI('/deleteIntent', 'POST', body);
            })
			.then(response => {
				$intentSelector[0].selectize.removeOption(selectIntent);
				$intentSelector[0].selectize.refreshOptions(false);
				$intentSelector[0].selectize.setValue('請選擇', true);
				$intentContent.html('');
				notify.success('移除意圖成功');
			})	
			.catch(error => {
				notify.danger('移除意圖失敗');
			})
        });
        $intentEditor.on('click', '#intent_import', e => {
            $importDataSidebar.find('#importTarget').html('Intent');
			$importDataSidebar.attr('target', 'intent');
			$importDataSidebar.toggleClass('active');
		});
        
		// entity list
		$entitySelector.on('change', e => {
			let target = $(e.target).val();

			if(!target) return;
            $entityContent.html('');
            
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ entity: target }, response);
                return callWatsonAPI('/getEntity', 'POST', body);
            })
            .then(response => {
                let data = response.result;
				$entityContent.html(generateValueAdder() + 
					(data.values.map(val => generateValueList(val)) || []).join('\n'));
				$('#entity_input').val(target);
				selectEntity = target;
            })
            .catch(error => { 
                console.log(error);
            });
		});
		$entityEditor.on('click', '#entity_add', e => {
			$addIntentEntitySidebar.toggleClass('active');
			$addIntentEntitySidebar.find('#new_entity').show();
			$addIntentEntitySidebar.find('#new_intent').hide();
			$addIntentEntitySidebar.find('#submit_add_entity').show();
			$addIntentEntitySidebar.find('#submit_add_intent').hide();
		});
		$addIntentEntitySidebar.on('click', '#submit_add_entity', e => {
			let $target = $(e.currentTarget);
			let newEntity = $('#new_entity_input').val().trim();

			if(!newEntity) return;

            $target.attr('disabled', true);
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ entity: newEntity }, response);
                return callWatsonAPI('/createEntity', 'POST', body);
            })
			.then(response => {
				$entitySelector[0].selectize.addOption({ value: newEntity, text: newEntity });
				$entitySelector[0].selectize.refreshOptions(false);
				$entitySelector[0].selectize.setValue(newEntity, false);
				$addIntentEntitySidebar.toggleClass('active');
				notify.success('新增實體成功');
			})	
			.catch(error => {
				notify.danger('新增實體失敗');
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
		});
		$entityEditor.on('click', '#entity_name_edit', e => {
			if(!selectEntity) return;

			let $parent = $(e.currentTarget).parent().parent().parent();
			$('#entity_name_input').val(selectEntity);
			$parent.children('div').toggleClass('d-none');
		});
		$entityEditor.on('click', '#entity_name_submit', e => {
			let newEntityName = $('#entity_name_input').val().trim();
            let $parent = $(e.currentTarget).parent().parent().parent();

			if(!newEntityName) return;
            
            mainController.getAssistantConfig()
            .then(response => {
                if(selectEntity == newEntityName) return Promise.resolve();
                let body = Object.assign({ entity: newEntityName }, response);
                return callWatsonAPI('/createEntity', 'POST', body);
            })
			.then(response => {
				$entitySelector[0].selectize.updateOption(selectEntity, { value: newEntityName, text: newEntityName });
				$entitySelector[0].selectize.refreshOptions(false);
				$entitySelector[0].selectize.setValue(newEntityName, true);
				selectEntity = newEntityName;

				$parent.children('div').toggleClass('d-none');
				notify.success('修改意圖名稱成功');
			})	
			.catch(error => {
				notify.danger('修改意圖名稱失敗');
			})
		});
		$entityEditor.on('click', '#entity_name_cancel', e => {
			let $parent = $(e.currentTarget).parent().parent().parent();
			$parent.children('div').toggleClass('d-none');
			$('#entity_name_input').val(selectEntity);
		});
		$entityEditor.on('click', '#entity_remove', e => {

			if(!selectEntity) return;
			
			if (confirm("即將刪除該Entity，確定要刪除?")) {
    			//
			} else {
				return;
			}

            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ entity: selectEntity }, response);
                return callWatsonAPI('/deleteEntity', 'POST', body);
            })
			.then(response => {
				$entitySelector[0].selectize.removeOption(selectEntity);
				$entitySelector[0].selectize.refreshOptions(false);
				$entitySelector[0].selectize.setValue('請選擇', true);
				$entityContent.html('');
				notify.success('移除Entity成功');
			})	
			.catch(error => {
				notify.danger('移除Entity失敗');
			})
        });
        $entityEditor.on('click', '#entity_import', e => {
            $importDataSidebar.find('#importTarget').html('Entity')
			$importDataSidebar.attr('target', 'entity');
			$importDataSidebar.toggleClass('active');
		});
		

        // edit examples
		$intentContent.on('click', '[content="edit_example"]', e => {
			$(e.currentTarget).parent().parent().children().toggleClass('d-none');
		});
		$intentContent.on('click', '[content="delete_example"]', e => {

			let $targetRow = $(e.currentTarget).parent().parent().parent();
			let selectExample = $targetRow.find('.training_list_content').html();

            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ deleteExample: { intent: selectIntent, text: selectExample } }, response);
                return callWatsonAPI('/deleteExample', 'POST', body);
            })
			.then(response => {
				$targetRow.remove();
				notify.success('刪除例句成功');
			})	
			.catch(error => {
				notify.danger('刪除例句失敗');
			})
		});
		$intentContent.on('click', '[content="update_example"]', e => {
			
			let $targetRow = $(e.currentTarget).parent().parent().parent();
			let selectExample = $targetRow.find('.training_list_content').html();
			let editedExample = $targetRow.find('input').val().trim();

            if(!editedExample) return;
            
            mainController.getAssistantConfig()
            .then(response => {

                if(selectExample == editedExample) return Promise.resolve();

                let body = Object.assign({ newExample: { 
                    intent: selectIntent,
                    text: selectExample,
                    newText: editedExample
                } }, response);

                return callWatsonAPI('/updateExample', 'POST', body);
            })
			.then(response => {
				$targetRow.find('.training_list_content').html(editedExample);
				$targetRow.children().children().toggleClass('d-none');
				notify.success('編輯例句成功');
			})
			.catch(error => {
				notify.danger('編輯例句失敗');
			})
		});
		$intentContent.on('click', '[content="cancel_edit_example"]', e => {
			let $targetRow = $(e.currentTarget).parent().parent().parent();

			$targetRow.children().children().toggleClass('d-none');
		});
		$intentContent.on('click', '[content="add_example"]', e => {

			let $targetRow = $(e.currentTarget).parent().parent().parent();
			let newExample = $targetRow.find('input').val().trim();

			if(!newExample) return;

			mainController.getAssistantConfig()
            .then(response => {

                let body = Object.assign({ newExample: { 
                    intent: selectIntent,
                    text: newExample
                } }, response);

                return callWatsonAPI('/createExample', 'POST', body);
            })
			.then(response => {
                let data = response.result;
				$targetRow.after(generateExampleList(data));
				$targetRow.find('input').val('');
				notify.success('新增例句成功');
			})	
			.catch(error => {
				notify.danger('新增例句失敗');
			})
		})	

        // edit value
		$entityContent.on('click', '[content="edit_value"]', e => {
			selectValue = $(e.currentTarget).parent().parent().children('.training_list_content').attr('value');
            
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ targetValue: { entity: selectEntity, value: selectValue } }, response);
                return callWatsonAPI('/listSynonyms', 'POST', body);
            })
			.then(response => {
                let data = response.result;
				$('#edited_value').val(selectValue);
				$('#synonyms').html(data.synonyms.map(syn => {
					return `<div class="input-group input-group-sm col-4 mb-3">
							<input type="text" class="form-control" value="${syn.synonym}">
							<div class="input-group-append">
								<button class="btn btn-sm nowrap bg_blue remove_synonym" type="button"><i class="fas fa-trash-alt fa-fw text_white"></i></button>
							</div>
						</div>`
				}))

				$editValueAndSynonymsSidebar.toggleClass('active');
				// notify.success('取得Value成功');
			})	
			.catch(error => {
				notify.danger('取得Value失敗');
			})
		});
		$entityContent.on('click', '[content="delete_value"]', e => {
			let $targetRow = $(e.currentTarget).parent().parent().parent();
			selectValue = $(e.currentTarget).parent().parent().children('.training_list_content').attr('value');
            
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ targetValue: { entity: selectEntity, value: selectValue } }, response);
                return callWatsonAPI('/deleteValue', 'POST', body);
            })
			.then(response => {
				$targetRow.remove();
				notify.success('刪除Value成功');
			})	
			.catch(error => {
				notify.danger('刪除Value失敗');
			})
		});
		$entityContent.on('click', '[content="add_value"]', e => {
			let $targetRow = $(e.currentTarget).parent().parent().parent();
			let newValue = $targetRow.find('input').val().trim();

            if(!newValue) return;
            
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ targetValue: { entity: selectEntity, value: newValue } }, response);
                return callWatsonAPI('/createValue', 'POST', body);
            })
			.then(response => {
                let data = response.result;
				$targetRow.after(generateValueList(data));
				$targetRow.find('input').val('');
				notify.success('新增Value成功');
			})	
			.catch(error => {
				notify.danger('新增Value失敗');
			})
		});

        // synonyms
		$editValueAndSynonymsSidebar.on('click', '#add_synonym', e => {
            let newSynonym = $('#new_synonym').val().trim();
			let synonyms = $('#synonyms').find('input').toArray().map(syn => $(syn).val().trim() );
            synonyms.push(newSynonym);

			if(!newSynonym) return;
            if(!checkSynonyms(synonyms)) { notify.danger('有重複的同義字'); return; };

			$('#new_synonym').val('');
			$('#synonyms').append(`
				<div class="input-group input-group-sm col-4 mb-3">
					<input type="text" class="form-control" value="${newSynonym}">
					<div class="input-group-append">
						<button class="btn btn-sm nowrap bg_blue remove_synonym" type="button"><i class="fas fa-trash-alt fa-fw text_white"></i></button>
					</div>
				</div>`);
		});
		$editValueAndSynonymsSidebar.on('click', '.remove_synonym', e => {
			$(e.currentTarget).parent().parent().remove();
		});
		$editValueAndSynonymsSidebar.on('click', '#submit_edit_value', e => {
			let valueName = $('#edited_value').val();
			let synonyms = $('#synonyms').find('input').toArray().map(syn => $(syn).val().trim() );

			if(!valueName) { notify.danger('缺少同義字名稱'); return; };
            if(!checkSynonyms(synonyms)) { notify.danger('有重複的同義字'); return; };
            
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign({ newValue: {
                    entity: selectEntity,
                    value: valueName,
                    newSynonyms: synonyms
                } }, response);
                return callWatsonAPI('/updateValue', 'POST', body);
            })
			.then(response => {
				$(`.training_list_content[value="${selectValue}"]`)
					.attr('value', valueName)
					.html(`<span class="badge badge-info mr-2">${valueName}</span>${(synonyms || []).join(',')}`);

					$editValueAndSynonymsSidebar.toggleClass('active');

                notify.success('編輯Value成功');
			})	
			.catch(error => {
				notify.danger('編輯Value失敗');
			});
        });
        
        // import
        $importDataSidebar.on('click', '#submit_import', e => {
            let $target = $(e.currentTarget);
            let importTarget = $importDataSidebar.attr('target');
            let importMethod = $importDataSidebar.find('.nav .nav-link.active').attr('aria-controls');

            $target.attr('disabled', true);
            return (() => {
				if(importMethod == 'file') {
                    let file = $importDataSidebar.find('input')[0].files[0];
                    let fl = new FileLoader(file, 'csv');

                    return fl.readFile()
                    .catch(error => {
                        return Promise.reject('選擇檔案錯誤')
                    });
				} else if (importMethod == 'paste') {
					return Promise.resolve($importDataSidebar.find('textarea').val());
				}
            })()
            .then(text => {

                return (() => {
                    if(importTarget == 'intent') {
                        return importIntent(parseCsvIntentData(text));
                    } else if (importTarget == 'entity') {
                        return importEntity(parseCsvEntityData(text));
                    }
                })();
            })
			.then(() => {
				$importDataSidebar.toggleClass('active');
                $target.attr('disabled', false);
			})
			.catch(error => {

			});
        })
        $importDataSidebar.on('change', 'input[type="file"]', e => {
            //get the file name
            var fileName = $(e.currentTarget).val();
            //replace the "Choose a file" label
            $(e.currentTarget).next('.custom-file-label').html(fileName);
        })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        let maskId = stableMask('取得資料中，請稍後')

        mainController.getAssistantConfig()
        .then(response => {
            return Promise.all([
                callWatsonAPI('/listIntents', 'POST', response),
                callWatsonAPI('/listEntities', 'POST', response),
                callWatsonAPI('/listCounterexamples', 'POST', response),
            ]);
        })
        .then(responses => {
            let intentsRes = responses[0].result,
                entitiesRes = responses[1].result,
                counterExamplesRes = responses[2].result;
            
            workspace = {
                intents: intentsRes,
                entities: entitiesRes,
            }

            if($intentSelector[0].selectize) $intentSelector[0].selectize.destroy();
            if($entitySelector[0].selectize) $entitySelector[0].selectize.destroy();
            
            // intent
            $intentSelector.html(`<option>請選擇</option>`+intentsRes.intents.map(intent => {
                return `<option value="${intent.intent}">${intent.intent}</option>`;
            }).join('\n'));

            // entity
            $entitySelector.html(`<option>請選擇</option>`+entitiesRes.entities.map(entity => {
                return `<option value="${entity.entity}">${entity.entity}</option>`;
            }).join('\n'));

            // counterexample
            // $('.training_list_body[content="counterexamples"]').html(generateCounterExampleAdder() + 
            //     (counterExamplesRes.counterexamples.map(ce => generateCounterExampleList(ce)) || []).join('\n'));

            $intentSelector.selectize({ 
                create: false, 
                sortField: 'text', 
                inputClass: 'form-control form-control-sm selectize-input', 
                dropdownParent: "body" 
            });
            $entitySelector.selectize({ 
                create: false, 
                sortField: 'text', 
                inputClass: 'form-control form-control-sm selectize-input', 
                dropdownParent: "body" 
            });
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            removeMask(maskId);
        });
        
        haveInit = true;
    }

    // private functions
    function generateExampleList(example) {
        return `<li>
                    <div class="training_list_item">
                        <div class="training_list_content">${example.text}</div>
                        <input type="text" class="form-control form-control-sm mx-2 d-none" value="${example.text}">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn_outline_blue" content="edit_example">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button type="button" class="btn btn_outline_blue" content="delete_example">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <div class="btn-group btn-group-sm d-none" role="group">
                            <button type="button" class="btn btn_outline_blue" content="update_example">
                                <i class="fas fa-check"></i>
                            </button>
                            <button type="button" class="btn btn_outline_blue" content="cancel_edit_example">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </li>`;
        
    }
    function generateExampleAdder() {
        
        // <button type="button" class="btn btn_outline_blue" content="import_example">
        // 	<i class="fas fa-folder-plus"></i>
        // </button>

        return `<li>
                    <div class="training_list_item">
                        <input type="text" class="form-control form-control-sm mx-2">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn_outline_blue" content="add_example">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </li>`;
    }
    function generateValueList(value) {
        return `<li>
                    <div class="overflow-auto training_list_item">
                        <div class="training_list_content" value="${value.value}">
                            <span class="badge badge-info mr-2">${value.value}</span>${(value.synonyms || []).join(',')}
                        </div>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn_outline_blue" content="edit_value">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button type="button" class="btn btn_outline_blue" content="delete_value">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </li>`;
    }
    function generateValueAdder() {
        return `<li>
                    <div class="training_list_item">
                        <input type="text" class="form-control form-control-sm mx-2">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn_outline_blue" content="add_value">
                                <i class="fas fa-plus"></i>
                            </button>
                            <!-- <button type="button" class="btn btn_outline_blue" content="import_values">
                                <i class="fas fa-folder-plus"></i>
                            </button> -->
                        </div>
                    </div>
                </li>`
    }
    function generateCounterExampleList(ce) {
        return `<li>
                <div class="training_list_item">
                    <div class="training_list_content">${ce.text}</div>
                    <input type="text" class="form-control form-control-sm mx-2 d-none" value="${ce.text}">
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn_outline_blue" content="edit_counterexample">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button type="button" class="btn btn_outline_blue" content="delete_counterexample">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="btn-group btn-group-sm d-none" role="group">
                        <button type="button" class="btn btn_outline_blue" content="update_counterexample">
                            <i class="fas fa-check"></i>
                        </button>
                        <button type="button" class="btn btn_outline_blue" content="cancel_edit_counterexample">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </li>`;
    }
    function generateCounterExampleAdder() {
        return `<li>
                <div class="training_list_item">
                    <input type="text" class="form-control form-control-sm mx-2">
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn_outline_blue" content="add_counterexample">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </li>`;
    }

    // 檢查重複的同義字
    function checkSynonyms(array) {
        return array.filter(item => {
            if(!item || array.filter(i => i == item).length > 1) return true;
        }).length <= 0;
    }

    // for 匯入
    function parseCsvIntentData(csvString) {
        let intents = {};
        csvString.split('\n').forEach(row => {
            let ss = row.split(',');
            if(ss.length < 2) return ;
            if(intents.hasOwnProperty(ss[1])) {
                intents[ss[1]].push(ss[0]);
            } else {
                intents[ss[1]] = [ss[0]];
            }
        })
        
        return intents;
    }
    function parseCsvEntityData(csvString) {
        let entities = {};
        csvString.split('\n').forEach(row => {
            let ss = row.split(',');
            if(ss.length < 1) return;

            if(ss[0] && !entities.hasOwnProperty(ss[0])) {
                entities[ss[0]] = { }
            } else {
                // pass
            }
            if(ss.length < 2) return;

            if(ss[1] && !entities[ss[0]].hasOwnProperty(ss[1])) {
                entities[ss[0]][ss[1]] = [];
            } else {
                // pass
            }
            if(ss.length < 3) return;

            let synonyms = ss.slice(2);
            synonyms.forEach(s => {
                let synonym = entities[ss[0]][ss[1]].find(_s => _s == s);
                if(synonym) {
                    // pass
                } else {
                    entities[ss[0]][ss[1]].push(s);
                }
            })
        })
            
        return entities;
    }
    function importIntent(intents) {
        notify.info('資料匯入中');
        return mainController.getAssistantConfig()
        .then(response => {
            let body = Object.assign({ properties: { _export: true } }, response);
            return callWatsonAPI('/listIntents', 'POST', body);
        })
        .then(response => {
            let result = response.result, 
                change = false,
                countIntent = 0,
                countExample = 0;
                
            Object.keys(intents).forEach(intent => {
                let targetIntent = result.intents.find(i => i.intent == intent);

                if(targetIntent) {
                    intents[intent].forEach(example => {
                        let targetExample = targetIntent.examples.find(e => e.text == example);
                        
                        if(targetExample) {
                            // already exist, pass
                        } else {
                            change = true;
                            countExample ++;

                            targetIntent.examples.push({ text: example });
                        }
                    });
                } else {
                    change = true;
                    
                    let newIntent = {
                        intent: intent,
                        examples: []
                    }

                    intents[intent].forEach(example => { 
                        let targetExample = newIntent.examples.find(e => e.text == example);
                        if(!targetExample) {
                            countExample ++;
                            newIntent.examples.push({ text: example });
                        } else {
                            // pass
                        }
                    });

                    countIntent ++;
                    countExample += newIntent.examples.length;

                    result.intents.push(newIntent);
                }
            })

            if(change) {
                let msg = `確定要新增訓練? 共 ${ countIntent } 新Intents，${ countExample } 新Examples`
                
                if(confirm(msg)) {
                    return mainController.getAssistantConfig()
                    .then(response => {
                        let body = Object.assign({ newWorkspace: { intents: result.intents } }, response);
                        return callWatsonAPI('/updateWorkspace', 'POST', body);
                    })
                }
            }

            return Promise.resolve();
        })
        .then(response => {
            console.log('匯入完成')
            if(!response) {
                // change
            }else{
                notify.success('新增訓練成功，請稍待訓練生效');
                initPage();
            }
        })
        .catch(error => {
            notify.danger('匯入失敗');
        });
    }
    function importEntity(entities) {
        notify.info('資料匯入中');
        return mainController.getAssistantConfig()
        .then(response => {
            let body = Object.assign({ properties: { _export: true } }, response);
            return callWatsonAPI('/listEntities', 'POST', body);
        })
        .then(response => {
            let result = response.result;
            let updateEntity, 
                change = false,
                countEntity = 0,
                countValue = 0
                countSynonyms = 0,
                difference = {
                    newEntities: [],
                    newValues: [],
                    newSynonyms: []
                };
                
            Object.keys(entities).forEach(entity => {
                let targetEntity = result.entities.find(e => e.entity == entity);
                
                if(targetEntity) {
                    Object.keys(entities[entity]).forEach(values => {
                        let targetValue = targetEntity.values.find(e => e.value == value);
                        
                        if(targetValue) {
                            entities[entity][value].forEach(synonyms => {
                                let targetSynonyms = targetValue.synonyms.find(s => s == synonyms);
                                
                                if(targetSynonyms) {
                                    // pass
                                } else {
                                    change = true;
                                    countSynonyms ++;
                                    targetValue.synonyms.push(synonyms);
                                }
                            })
                        } else {
                            change = true;
                            countValue ++;
                            countSynonyms += entities[entity][value].length;

                            targetEntity.values.push({ type: 'synonyms', value: value, synonyms: entities[entity][value] });
                        }
                    })
                } else {
                    change = true;
                    countEntity ++;
                    countValue += Object.values(entities[entity]).length;
                    countSynonyms += Object.values(entities[entity]).map(value => Object.values(value).length).reduce((a, b) => a + b);

                    result.entities.push({ 
                        entity: entity, 
                        values: Object.keys(entities[entity]).map(value => {
                            return { type: 'synonyms', value: value, synonyms: entities[entity][value] }
                        })
                    });
                }
            })
            console.log('difference', difference)

            if(change) {
                let msg = `確定要新增訓練? 共 ${ countEntity } 新Entity，${ countValue } 新Value，${ countSynonyms } 新Synonyms`
                
                if(confirm(msg)) {
                    return mainController.getAssistantConfig()
                    .then(response => {
                        let body = Object.assign({ newWorkspace: { entities: result.entities } }, response);
                        return callWatsonAPI('/updateWorkspace', 'POST', body);
                    })
                }
            }

            return Promise.resolve();
        })
        .then(res => {
            if(!res) {
                // change
            }else{
                notify.success('新增訓練成功，請稍待訓練生效');
                initPage();
            }
        })
        .catch(error => {
            notify.danger('匯入失敗');
        });
    }
		
    function callWatsonAPI(assistantApi, method, body, headers) {
        Object.assign(body, {
            projectId: mainController.getProjectId()
        })
        return callBackendAPI('/watson/assistant' + assistantApi, method, body, headers);
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();