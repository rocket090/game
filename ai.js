 // グローバル変数
    let aiSecretNumber = "";         // AIの秘密数字（ランダム生成）
    let playerSecretNumber = "";     // プレイヤーが設定する秘密数字
    let currentGuess = "";
    let secretGuess = "";
    let humanAttemptCount = 0;       // 人間の試行回数
    let targetDigit = null;
    let currentTurn = "human";       // "human" または "ai"
    let humanMoveCount = 0;          // 人間の履歴番号
    let aiMoveCount = 0;             // AIの履歴番号

    // AIボーナスアクション使用済みフラグ
    let aiUsedHighLow = false;
    let aiUsedTarget = false;
    let aiUsedSlash = false;
    // AIボーナスヒント適用済みフラグ（Normal/Hard用）
    let aiBonusHintApplied = false;

    // AIの候補リスト（高度な戦略用）およびこれまでのAI推測
    let aiCandidates = [];
    let aiGuesses = [];

    // ページ読み込み時にAIの秘密数字を生成
    aiSecretNumber = generateNumber();

    // 3桁の異なる数字を生成
    function generateNumber() {
      let digits = new Set();
      while (digits.size < 3) {
        digits.add(Math.floor(Math.random() * 10));
      }
      return Array.from(digits).join('');
    }

    // グローバル変数（初期は Normal）
    let aiDifficulty = "Normal";

    // 難易度選択ボタンの色を更新する関数
    function selectDifficulty(difficulty) {
        aiDifficulty = difficulty;
        document.getElementById("diff-easy").style.backgroundColor = "";
        document.getElementById("diff-normal").style.backgroundColor = "";
        document.getElementById("diff-hard").style.backgroundColor = "";
        if(difficulty === "Easy") {
             document.getElementById("diff-easy").style.backgroundColor = "#999";
        } else if(difficulty === "Normal") {
             document.getElementById("diff-normal").style.backgroundColor = "#999";
        } else if(difficulty === "Hard") {
             document.getElementById("diff-hard").style.backgroundColor = "#999";
        }
        console.log("Difficulty set to", aiDifficulty);
    }

    // ページ読み込み時に初期状態として Normal を選択
    document.addEventListener('DOMContentLoaded', function() {
        selectDifficulty("Normal");
    });

    // AI候補リスト初期化（全3桁の重複なし数字）
    function initializeAICandidates() {
      let candidates = [];
      for (let i = 0; i <= 9; i++) {
        for (let j = 0; j <= 9; j++) {
          if (i === j) continue;
          for (let k = 0; k <= 9; k++) {
            if (i === k || j === k) continue;
            candidates.push("" + i + j + k);
          }
        }
      }
      return candidates;
    }

    // 決定的な候補選択（ランダム性を排除：候補リストをソートして最初のものを返す）
    function pickCandidate() {
      if (aiCandidates.length === 0) {
        console.warn("aiCandidates is empty. Reinitializing candidate list.");
        aiCandidates = initializeAICandidates();
      }
      let filtered = aiCandidates.filter(c => !aiGuesses.includes(c));
      if (filtered.length === 0) {
        return aiCandidates[0];
      }
      filtered.sort();
      return filtered[0];
    }

    // 推測結果（EAT, BITE）の計算
    function computeFeedback(secret, guess) {
      let eat = 0, bite = 0;
      for (let i = 0; i < 3; i++) {
        if (guess[i] === secret[i]) {
          eat++;
        } else if (secret.includes(guess[i])) {
          bite++;
        }
      }
      return {eat, bite};
    }

    /* ========= プレイヤー秘密数字設定 ========= */
    function toggleSecretDigit(digit) {
      let index = secretGuess.indexOf(digit.toString());
      if (index !== -1) {
        secretGuess = secretGuess.slice(0, index) + secretGuess.slice(index + 1);
        document.getElementById('secret-btn' + digit).classList.remove('disabled');
      } else if (secretGuess.length < 3) {
        secretGuess += digit;
        document.getElementById('secret-btn' + digit).classList.add('disabled');
      }
      document.getElementById('secret-guess').innerText = secretGuess;
    }

    function resetSecretInput() {
      secretGuess = "";
      document.getElementById('secret-guess').innerText = "";
      for (let i = 0; i <= 9; i++) {
        let btn = document.getElementById('secret-btn' + i);
        btn.classList.remove('disabled');
        btn.disabled = false;
        btn.onclick = function() { toggleSecretDigit(i); };
      }
      document.getElementById('goBtn').disabled = false;
      document.getElementById('secretResetBtn').disabled = false;
      console.log("resetSecretInput() 完了");
    }

    function confirmSecret() {
      if (secretGuess.length !== 3 || new Set(secretGuess).size !== 3) {
        alert("3桁の異なる数字を入力してください。");
        return;
      }
      playerSecretNumber = secretGuess;
      updateTurnMessage();
      aiCandidates = initializeAICandidates();
      aiGuesses = [];
      console.log("候補数:", aiCandidates.length);
      document.getElementById("player-secret-setup").style.display = "none";
      document.getElementById("game-area").style.display = "block";
      // ヒューマン入力を有効化
      enableHumanInput();
    }

    /* ========= turn-message の更新 ========= */
    function updateTurnMessage() {
      document.getElementById("turn-message").innerHTML =
        "（難易度: " + aiDifficulty + " あなたの数字: " + playerSecretNumber + ") <br>AIの数字を当ててください。<a href='https://ja.wikipedia.org/wiki/Numer0n#%E3%83%AB%E3%83%BC%E3%83%AB'>ルール</a>";
    }

    /* ========= 推測用操作 ========= */
    function toggleDigit(digit) {
      if (currentTurn !== "human") return;
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
        let btn = document.getElementById('btn' + i);
        btn.classList.remove('disabled');
        btn.disabled = false;
        btn.onclick = function() { toggleDigit(i); };
      }
      document.getElementById('action-result-message').innerText = '';
      console.log("resetInput() 完了");
    }

    /* ========= ゲーム全体のリセット ========= */
    function resetGame() {
      console.log("resetGame() 開始");
      aiSecretNumber = generateNumber();
      playerSecretNumber = "";
      currentGuess = "";
      secretGuess = "";
      humanAttemptCount = 0;
      targetDigit = null;
      currentTurn = "human";
      humanMoveCount = 0;
      aiMoveCount = 0;
      aiUsedHighLow = false;
      aiUsedTarget = false;
      aiUsedSlash = false;
      aiBonusHintApplied = false;
      aiCandidates = [];
      aiGuesses = [];
      document.getElementById('attempt-count').innerText = humanAttemptCount;
      document.getElementById('history').innerHTML = '';
      document.getElementById('action-result-message').innerText = '';
      document.getElementById('play-again').style.display = 'none';
      
      resetInput();
      document.querySelectorAll('#highLowBtn, #targetBtn, #slashBtn, #tryBtn').forEach(btn => {
          btn.disabled = false;
          btn.classList.remove('disabled'); // ここで "disabled" クラスを削除
          btn.style.backgroundColor = (btn.id === "tryBtn") ? "#add8e6" : "";
      });
      document.getElementById("player-secret-setup").style.display = "block";
      document.getElementById("game-area").style.display = "none";
      resetSecretInput();
      document.querySelectorAll('#difficulty-buttons button').forEach(btn => {
         btn.disabled = false;
      });
      console.log("resetGame() 完了");
    }

    function disableAllButtons() {
      document.querySelectorAll('button').forEach(btn => {
        if (btn.id !== 'play-again') {
          btn.disabled = true;
        }
      });
    }

    function recordAction(actionName, result, player) {
      let historyList = document.getElementById('history');
      let historyItem = document.createElement('li');
      historyItem.classList.add('history-entry');
      let moveIndex;
      if (player === "ai") {
        historyItem.classList.add('ai-history');
        aiMoveCount++;
        moveIndex = aiMoveCount;
      } else {
        historyItem.classList.add('human-history');
        humanMoveCount++;
        moveIndex = humanMoveCount;
      }
      let indexBox = document.createElement('div');
      indexBox.classList.add('history-index');
      indexBox.innerText = moveIndex;
      let textBox = document.createElement('div');
      textBox.classList.add('history-text');
      if(player === "ai"){
        textBox.style.color = "#333";
      }
      textBox.innerText = result;
      historyItem.appendChild(indexBox);
      historyItem.appendChild(textBox);
      historyList.appendChild(historyItem);
      return historyItem;
    }

    function processGuess(guess) {
      if (!guess || guess.length !== 3) {
        console.error("Invalid guess passed to processGuess:", guess);
        return;
      }
      if (currentTurn === "human") {
        humanAttemptCount++;
        document.getElementById('attempt-count').innerText = humanAttemptCount;
      }
      let currentSecret = (currentTurn === "human") ? aiSecretNumber : playerSecretNumber;
      let feedback = computeFeedback(currentSecret, guess);
      
      let historyItem = recordAction("Guess", `${guess} : ${feedback.eat}EAT ${feedback.bite}BITE`, currentTurn);
      
      if (currentTurn === "ai") {
        aiGuesses.push(guess);
        lastAIGuess = guess;
        lastAIFeedback = feedback;
      }
      
      if (feedback.eat === 0) {
        aiCandidates = aiCandidates.filter(candidate =>
          candidate[0] !== guess[0] &&
          candidate[1] !== guess[1] &&
          candidate[2] !== guess[2]
        );
        console.log("0EAT elimination applied, remaining candidates:", aiCandidates.length);
      }
      
      if (feedback.eat === 3) {
        historyItem.classList.add("correct");
        let indexDiv = historyItem.querySelector('.history-index');
        if (indexDiv) {
          indexDiv.style.backgroundColor = "red";
        }
        let textDiv = historyItem.querySelector('.history-text');
        if (textDiv) {
          textDiv.style.color = "black";
          textDiv.innerHTML = textDiv.innerHTML.replace(/3EAT/g, '<span style="color:red;font-weight:bold;">3EAT</span>');
        }
        document.getElementById('play-again').style.display = 'block';
        disableAllButtons();
        return;
      }
      
      resetInput();
      if (currentTurn === "human") {
        endHumanTurn();
      } else {
        currentTurn = "human";
        enableHumanInput();
      }
    }

    function humanGuess() {
      if (currentTurn !== "human") return;
      if (currentGuess.length !== 3) {
        alert("3桁の数字を入力してください。");
        return;
      }
      processGuess(currentGuess);
    }

    function highLow() {
      if (currentTurn !== "human") return;
      humanAttemptCount++;
      document.getElementById('attempt-count').innerText = humanAttemptCount;
      let currentSecret = aiSecretNumber;
      let result = "";
      for (let i = 0; i < 3; i++) {
        result += (Number(currentSecret[i]) < 5) ? '[LOW]' : '[HIGH]';
      }
      recordAction("HIGH & LOW", result, "human");
      document.getElementById('highLowBtn').classList.add('disabled');
      document.getElementById('highLowBtn').disabled = true;
      endHumanTurn();
    }

    function target() {
  if (currentTurn !== "human") return;
  // Targetボタンをすぐに無効化して連打を防ぐ
  document.getElementById('targetBtn').classList.add('disabled');
  document.getElementById('targetBtn').disabled = true;
  let currentSecret = aiSecretNumber;
  document.getElementById('action-result-message').innerText = "TARGET: 数字を選んでください。";
  document.querySelectorAll('#guess-number-buttons button').forEach(button => {
    button.onclick = function() {
      // ターゲット数字選択時のみ試行回数をカウント
      humanAttemptCount++;
      document.getElementById('attempt-count').innerText = humanAttemptCount;
      targetDigit = parseInt(button.innerText);
      let targetMessage = currentSecret.includes(targetDigit.toString()) ?
        `TARGET(${targetDigit}): 含まれている` :
        `TARGET(${targetDigit}): 含まれていない`;
      recordAction("TARGET", targetMessage, "human");
      // 通常の数字ボタンのonclickを復元
      document.querySelectorAll('#guess-number-buttons button').forEach(btn => {
        btn.onclick = function() { toggleDigit(parseInt(btn.innerText)); };
      });
      setTimeout(() => {
        document.getElementById('action-result-message').innerText = "";
        resetInput();
        endHumanTurn();
      }, 500);
    }
  });
}


    function slash() {
      if (currentTurn !== "human") return;
      humanAttemptCount++;
      document.getElementById('attempt-count').innerText = humanAttemptCount;
      let currentSecret = aiSecretNumber;
      let digits = currentSecret.split('');
      let maxDigit = Math.max(...digits.map(d => Number(d)));
      let minDigit = Math.min(...digits.map(d => Number(d)));
      let result = maxDigit - minDigit;
      recordAction("SLASH", `SLASH: ${result}`, "human");
      document.getElementById('slashBtn').classList.add('disabled');
      document.getElementById('slashBtn').disabled = true;
      endHumanTurn();
    }

    let lastAIGuess = "";
    let lastAIFeedback = null;

    // AIペナルティ推測ロジック（既存のもの）
    function aiHeuristicGuess(lastGuess, feedback) {
      let eat = feedback.eat, bite = feedback.bite;
      let newGuess = "";
      function getNewDigit(excludeSet) {
        for (let d = 0; d < 10; d++) {
          let ds = d.toString();
          if (!excludeSet.has(ds)) {
            excludeSet.add(ds);
            return ds;
          }
        }
        return null;
      }
      if(eat === 0 && bite === 0) {
        let available = [];
        for (let d = 0; d < 10; d++) {
          let ds = d.toString();
          if (!lastGuess.includes(ds)) {
            available.push(ds);
          }
        }
        available.sort();
        newGuess = available.slice(0, 3).join('');
      }
      else if(eat === 0 && bite === 1) {
        let exclude = new Set(lastGuess.split(''));
        newGuess = lastGuess[1] + lastGuess[0] + getNewDigit(exclude);
      }
      else if(eat === 0 && bite === 2) {
        let exclude = new Set(lastGuess.split(''));
        newGuess = getNewDigit(exclude) + lastGuess[1] + lastGuess[2];
      }
      else if((eat === 1 && bite === 0) || (eat === 2 && bite === 0)) {
        let exclude = new Set(lastGuess.split(''));
        newGuess = lastGuess[1] + getNewDigit(exclude) + lastGuess[2];
      }
      else if(eat === 1 && bite === 1) {
        let exclude = new Set(lastGuess.split(''));
        newGuess = lastGuess[0] + getNewDigit(exclude) + getNewDigit(exclude);
      }
      else {
        newGuess = pickCandidate();
      }
      return newGuess;
    }

    /* ---------- AIボーナスアクション（従来通り） ---------- */
    function aiHighLowAction() {
      aiUsedHighLow = true;
      let pattern = "";
      for (let i = 0; i < 3; i++) {
        pattern += (Number(playerSecretNumber[i]) < 5) ? '[LOW]' : '[HIGH]';
      }
      recordAction("HIGH & LOW", pattern, "ai");
      aiCandidates = aiCandidates.filter(candidate => {
        let candidatePattern = "";
        for (let i = 0; i < 3; i++) {
          candidatePattern += (Number(candidate[i]) < 5) ? '[LOW]' : '[HIGH]';
        }
        return candidatePattern === pattern;
      });
      console.log("highLowアクション後: 候補数 =", aiCandidates.length);
      endAITurn();
    }

    function aiTargetAction() {
      aiUsedTarget = true;
      let freq = Array(10).fill(0);
      for (let candidate of aiCandidates) {
        for (let digit of candidate) {
          freq[Number(digit)]++;
        }
      }
      let targetDigitCandidate = null;
      let minDiff = Infinity;
      for (let d = 0; d < 10; d++) {
        let diff = Math.abs(freq[d] - aiCandidates.length / 2);
        if (diff < minDiff) {
          minDiff = diff;
          targetDigitCandidate = d;
        }
      }
      targetDigit = targetDigitCandidate;
      let currentSecret = playerSecretNumber;
      let targetMessage;
      if (currentSecret.includes(targetDigit.toString())) {
        targetMessage = `TARGET(${targetDigit}): 含まれている`;
        aiCandidates = aiCandidates.filter(candidate => candidate.includes(targetDigit.toString()));
      } else {
        targetMessage = `TARGET(${targetDigit}): 含まれていない`;
        aiCandidates = aiCandidates.filter(candidate => !candidate.includes(targetDigit.toString()));
      }
      recordAction("TARGET", targetMessage, "ai");
      console.log("targetアクション後: 選択数字 =", targetDigit, "候補数 =", aiCandidates.length);
      endAITurn();
    }

    function aiSlashAction() {
      aiUsedSlash = true;
      let currentSecret = playerSecretNumber;
      let digits = currentSecret.split('');
      let maxDigit = Math.max(...digits.map(d => Number(d)));
      let minDigit = Math.min(...digits.map(d => Number(d)));
      let slashResult = maxDigit - minDigit;
      recordAction("SLASH", `SLASH: ${slashResult}`, "ai");
      aiCandidates = aiCandidates.filter(candidate => {
        let cdigits = candidate.split('');
        let cmax = Math.max(...cdigits.map(d => Number(d)));
        let cmin = Math.min(...cdigits.map(d => Number(d)));
        return (cmax - cmin) === slashResult;
      });
      console.log("slashアクション後: 候補数 =", aiCandidates.length);
      endAITurn();
    }

    /* ---------- AIターン ---------- */
    function aiTurn() {
      updateTurnMessage();
      disableHumanInput();

      // ★ 難易度に応じたボーナスヒントの適用（初回のみ） ★
      if (!aiBonusHintApplied) {
        if (aiDifficulty === "Normal") {
          // Normal: プレイヤー秘密数字の1桁（位置は伏せる＝ここでは最初の桁）をボーナスとして与える
          let bonusDigit = playerSecretNumber[0];
          // recordAction("AI Bonus Hint", `Bonus digit provided: ${bonusDigit}`, "ai");
          aiCandidates = aiCandidates.filter(candidate => candidate.includes(bonusDigit));
          aiBonusHintApplied = true;
        } else if (aiDifficulty === "Hard") {
          // Hard: プレイヤー秘密数字の2桁（最初の2桁）をボーナスとして与える
          let bonusDigits = playerSecretNumber.substring(0, 2);
          // recordAction("AI Bonus Hint", `Bonus digits provided: ${bonusDigits}`, "ai");
          aiCandidates = aiCandidates.filter(candidate => bonusDigits.split('').every(d => candidate.includes(d)));
          aiBonusHintApplied = true;
        }
      }
      
      console.log("AIターン開始: 候補数 =", aiCandidates.length);
      
      // 候補数が極端に少ない場合は、決定的な選択で即推測
      if(aiCandidates.length <= 10) {
        let newGuess = pickCandidate();
        console.log("候補数が少ないので即推測 =", newGuess, aiCandidates.length);
        processGuess(newGuess);
        endAITurn();
        return;
      }
      
      // ボーナスアクションは従来の選択ロジック（aiChooseAction）はそのまま利用
      let action = aiChooseAction();
      console.log("AI action chosen:", action);
      
      if(action === "highLow") {
        aiHighLowAction();
        return;
      } else if(action === "target") {
        aiTargetAction();
        return;
      } else if(action === "slash") {
        aiSlashAction();
        return;
      } else { 
        // normalGuess：全難易度共通（ランダム性ゼロの決定的処理）
        let newGuess = "";
        if(lastAIGuess !== "" && lastAIFeedback !== null) {
             newGuess = aiHeuristicGuess(lastAIGuess, lastAIFeedback);
             console.log("AI (" + aiDifficulty + "): ヘルリスティック推測 =", newGuess);
        } else {
             newGuess = "123";
             console.log("AI (" + aiDifficulty + "): 初回推測 =", newGuess);
        }
        while(newGuess === lastAIGuess) {
          newGuess = aiHeuristicGuess(lastAIGuess, lastAIFeedback);
          console.log("前回と同じ推測になったため、再推測 =", newGuess);
        }
        processGuess(newGuess);
        endAITurn();
      }
    }

    function endHumanTurn() {
      currentTurn = "ai";
      disableHumanInput();
      setTimeout(aiTurn, 1000);
    }

    function endAITurn() {
      currentTurn = "human";
      updateTurnMessage();
      enableHumanInput();
    }

    function disableHumanInput() {
      document.querySelectorAll('#guess-number-buttons button').forEach(btn => {
        btn.disabled = true;
        btn.style.backgroundColor = "#999";
      });
      document.querySelectorAll('.action-buttons button').forEach(btn => {
        btn.disabled = true;
        btn.style.backgroundColor = "#999";
      });
    }

    function enableHumanInput() {
      document.querySelectorAll('#guess-number-buttons button').forEach(btn => {
        btn.disabled = false;
        btn.style.backgroundColor = "";
      });
      document.querySelectorAll('.action-buttons button').forEach(btn => {
        btn.disabled = false;
        btn.style.backgroundColor = (btn.id === "tryBtn") ? "#add8e6" : "";
      });
      resetInput();
    }

    // aiChooseActionは従来のロジック（決定的）をそのまま利用
    function aiChooseAction() {
        let bestAction = "normalGuess";
        let bestCandidatesCount = aiCandidates.length;

        if (!aiUsedHighLow) {
          let pattern = "";
          for (let i = 0; i < 3; i++) {
            pattern += (Number(playerSecretNumber[i]) < 5) ? '[LOW]' : '[HIGH]';
          }
          let highLowCandidates = aiCandidates.filter(candidate => {
            let candidatePattern = "";
            for (let i = 0; i < 3; i++) {
              candidatePattern += (Number(candidate[i]) < 5) ? '[LOW]' : '[HIGH]';
            }
            return candidatePattern === pattern;
          });
          if (highLowCandidates.length < bestCandidatesCount) {
            bestCandidatesCount = highLowCandidates.length;
            bestAction = "highLow";
          }
        }

        if (!aiUsedTarget && aiCandidates.length > 40) {
          let freq = Array(10).fill(0);
          for (let candidate of aiCandidates) {
            for (let digit of candidate) {
              freq[Number(digit)]++;
            }
          }
          let bestTargetDigit = null;
          let bestDiff = Infinity;
          for (let d = 0; d < 10; d++) {
            let diff = Math.abs(freq[d] - aiCandidates.length / 2);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestTargetDigit = d;
            }
          }
          let includeCandidates = aiCandidates.filter(candidate => candidate.includes(bestTargetDigit.toString()));
          let excludeCandidates = aiCandidates.filter(candidate => !candidate.includes(bestTargetDigit.toString()));
          let targetCandidatesCount = Math.min(includeCandidates.length, excludeCandidates.length);
          if (targetCandidatesCount < bestCandidatesCount) {
            bestCandidatesCount = targetCandidatesCount;
            bestAction = "target";
          }
        }

        if (!aiUsedSlash && aiCandidates.length > 10) {
          let digits = playerSecretNumber.split('');
          let playerMax = Math.max(...digits.map(d => Number(d)));
          let playerMin = Math.min(...digits.map(d => Number(d)));
          let slashResult = playerMax - playerMin;
          let slashCandidates = aiCandidates.filter(candidate => {
            let cdigits = candidate.split('');
            let cmax = Math.max(...cdigits.map(d => Number(d)));
            let cmin = Math.min(...cdigits.map(d => Number(d)));
            return (cmax - cmin) === slashResult;
          });
          if (slashCandidates.length < bestCandidatesCount) {
            bestCandidatesCount = slashCandidates.length;
            bestAction = "slash";
          }
        }
        return bestAction;
    }
