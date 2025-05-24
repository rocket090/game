let secretNumber = generateNumber();
        let currentGuess = "";
        let attemptCount = 0;
        let targetDigit = null;
        let highLowResult = false;
        let slashResult = null;
        let isTargetUsed = false;

        function generateNumber() {
            let digits = new Set();
            while (digits.size < 3) {
                digits.add(Math.floor(Math.random() * 10));
            }
            return Array.from(digits).join('');
        }

        function toggleDigit(digit) {
            let index = currentGuess.indexOf(digit.toString());
            if (index !== -1) {
                currentGuess = currentGuess.slice(0, index) + currentGuess.slice(index + 1);
                document.getElementById('btn' + digit).classList.remove('disabled');
            } else if (currentGuess.length < 3) {
                currentGuess += digit;
                document.getElementById('btn' + digit).classList.add('disabled');
            }
            document.getElementById('guess').innerText = currentGuess;
        }

        function resetInput() {
            currentGuess = "";
            document.getElementById('guess').innerText = currentGuess;
            for (let i = 0; i <= 9; i++) {
                document.getElementById('btn' + i).classList.remove('disabled');
                document.getElementById('btn' + i).onclick = function() { toggleDigit(i); };
            }
            document.getElementById('action-result-message').innerText = '';
        }

        function resetGame() {
            // ゲームの変数をリセット
            secretNumber = generateNumber();
            currentGuess = "";
            attemptCount = 0;
            targetDigit = null;
            highLowResult = false;
            slashResult = null;
            isTargetUsed = false;

            // UIをリセット
            document.getElementById('attempt-count').innerText = attemptCount;
            document.getElementById('history').innerHTML = '';  // 履歴をクリア
            document.getElementById('action-result-message').innerText = '';
            document.getElementById('play-again').style.display = 'none';  // もう一度プレイボタンを隠す

            // ボタンの状態をリセット
            resetInput();
            document.getElementById('highLowBtn').classList.remove('disabled');
            document.getElementById('targetBtn').classList.remove('disabled');
            document.getElementById('slashBtn').classList.remove('disabled');
        }

        function checkGuess() {
            if (currentGuess.length !== 3) {
                return;
            }
            attemptCount++;
            document.getElementById('attempt-count').innerText = attemptCount;
            let eat = 0, bite = 0;
            for (let i = 0; i < 3; i++) {
                if (currentGuess[i] === secretNumber[i]) {
                    eat++;
                } else if (secretNumber.includes(currentGuess[i])) {
                    bite++;
                }
            }
            let historyList = document.getElementById('history');
            let historyItem = document.createElement('li');
            historyItem.classList.add('history-entry');
            
            let indexBox = document.createElement('div');
            indexBox.classList.add('history-index');
            indexBox.innerText = attemptCount;
            
            let textBox = document.createElement('div');
            textBox.classList.add('history-text');
            textBox.innerText = `${currentGuess} : ${eat}EAT ${bite}BITE`;
            
            historyItem.appendChild(indexBox);
            historyItem.appendChild(textBox);
            historyList.appendChild(historyItem);
            
            if (eat === 3) {
                historyItem.classList.add('correct');
                indexBox.classList.add('correct-index');
                textBox.innerHTML = `${currentGuess} : <span style="color: red; font-weight: bold;">${eat}EAT</span> ${bite}BITE`;
                document.getElementById('play-again').style.display = 'block';
            }
            resetInput();
        }

        function highLow() {
            attemptCount++;
            let result = "";
            for (let i = 0; i < 3; i++) {
                result += secretNumber[i] < 5 ? '[LOW]' : '[HIGH]';
            }
            recordAction("HIGH & LOW", result);
            document.getElementById('highLowBtn').classList.add('disabled');
        }

        function target() {
            attemptCount++;
            let targetMessage = "";
            isTargetUsed = true;
            document.getElementById('action-result-message').innerText = "TARGET: 数字を選んでください。";
            document.querySelectorAll('.number-buttons button').forEach(button => {
                button.onclick = function() {
                    targetDigit = parseInt(button.innerText);
                    if (secretNumber.includes(targetDigit.toString())) {
                        targetMessage = `TARGET(${targetDigit}): 含まれている`;
                    } else {
                        targetMessage = `TARGET(${targetDigit}): 含まれていない`;
                    }
                    recordAction("TARGET", targetMessage);
                    document.querySelectorAll('.number-buttons button').forEach(btn => btn.onclick = null);  // 数字ボタンのリセット
                    document.getElementById('targetBtn').classList.add('disabled');
                    // 数字入力の復帰
                    setTimeout(() => {
                        resetInput(); // 入力をリセットし、再度数字ボタンが有効化される
                    }, 500);
                }
            });
        }

        function slash() {
            attemptCount++;
            let digits = secretNumber.split('');
            let maxDigit = Math.max(...digits);
            let minDigit = Math.min(...digits);
            let result = maxDigit - minDigit;
            recordAction("SLASH", `SLASH: ${result}`);
            document.getElementById('slashBtn').classList.add('disabled');
        }

        function recordAction(actionName, result) {
            let historyList = document.getElementById('history');
            let historyItem = document.createElement('li');
            historyItem.classList.add('history-entry');
            
            let indexBox = document.createElement('div');
            indexBox.classList.add('history-index');
            indexBox.innerText = attemptCount;
            
            let textBox = document.createElement('div');
            textBox.classList.add('history-text');
            textBox.innerText = `${result}`;
            
            historyItem.appendChild(indexBox);
            historyItem.appendChild(textBox);
            historyList.appendChild(historyItem);
        }
