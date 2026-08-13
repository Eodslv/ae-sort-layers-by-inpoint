(function () {
    var undoName = "Sort Layers By In Point";
    app.beginUndoGroup(undoName);

    try {
        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)) {
            alert("컴포지션을 선택해주세요.");
            return;
        }

        // 기본 클릭: 늦은 inPoint부터 위로 정렬
        // Ctrl + 클릭: 빠른 inPoint부터 위로 정렬
        var ctrlPressed = ScriptUI.environment.keyboardState.ctrlKey;

        var layers = comp.selectedLayers;

        // 선택 레이어가 없으면 전체 레이어를 대상으로 함
        if (layers.length === 0) {
            layers = [];
            for (var i = 1; i <= comp.numLayers; i++) {
                layers.push(comp.layer(i));
            }
        } else {
            // selectedLayers의 배열 순서를 기준으로 삼지 않고
            // 현재 레이어 패널 순서(위 -> 아래)를 보존
            layers = [];
            for (var j = 1; j <= comp.numLayers; j++) {
                var currentLayer = comp.layer(j);
                if (currentLayer.selected) {
                    layers.push(currentLayer);
                }
            }
        }

        // 안정 정렬: inPoint가 같으면 기존 레이어 패널 순서를 유지
        var indexedLayers = [];
        for (var k = 0; k < layers.length; k++) {
            indexedLayers.push({
                layer: layers[k],
                originalIndex: k
            });
        }

        indexedLayers.sort(function (a, b) {
            var timeDifference;

            if (ctrlPressed) {
                // Ctrl + 클릭: 빠른 시작 시간부터
                timeDifference = a.layer.inPoint - b.layer.inPoint;
            } else {
                // 기본 클릭: 늦은 시작 시간부터
                timeDifference = b.layer.inPoint - a.layer.inPoint;
            }

            if (timeDifference !== 0) {
                return timeDifference;
            }

            return a.originalIndex - b.originalIndex;
        });

        // 최종 배열 순서대로 레이어 패널 위 -> 아래에 배치
        for (var m = indexedLayers.length - 1; m >= 0; m--) {
            indexedLayers[m].layer.moveToBeginning();
        }
    } finally {
        app.endUndoGroup();
    }
})();
