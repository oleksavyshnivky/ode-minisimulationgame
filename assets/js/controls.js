// Author: Oleksa Vysnivsky a.k.a. ODE
// Email: me@ovyshnivsky.pp.ua
// ————————————————————————————————————————————————————————————————————————————————————————————————————

var gamedata = false	// Ігрові дані

var simulation = {
	on: false, // Чи є зараз активне моделювання (у стані між створенням і кінцем світу)
	stepOn: false,	// Чи виконується зараз крок
	externalURL: '', // Зовнішній URL для зберігання/завантаження gamedata
	intervalId: false, // Ідентифікатор авторозрахунку
	timeStep: 1, // Час між розхрахунком сезонів, секунд
	defineGamedata: function() {
		if (typeof defineGamedata === 'function') {
			defineGamedata()
			return
		}
		gamedata = {
			curSeason: 0
		}
	},
	// Створення світу
	initWorld: function() {
		if (simulation.on) return false

		simulation.on = true

		simulation.defineGamedata()
		simulation.runStep()

		setControlButtons()
	},
	// Розрахунок чергового кроку світу
	runStep: function() {
		if (simulation.stepOn) return false

		simulation.stepOn = true
		runStep()
		simulation.stepOn = false
	},
	// Кінець моделювання світу
	finishWorld: function() {
		if (!confirm('Це остаточне рішення?')) return false

		if (simulation.intervalId) simulation.stopAutoRun()
		simulation.on = false
		
		setControlButtons()
	},
	// Авторозрахунок
	autoRun: function() {
		if (simulation.intervalId) return false

		simulation.runStep()
		simulation.intervalId = setInterval(simulation.runStep, simulation.timeStep * 1000)

		setControlButtons()
	},
	// Зупинка авторозрахунку
	stopAutoRun: function() {
		clearInterval(simulation.intervalId)
		simulation.intervalId = false
		setControlButtons()
	},
}

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// ЛОКАЛЬНЕ СХОВИЩЕ
// Збереження даних у локальне сховище
function saveGamedata() {
	localStorage.setItem('gamedata', JSON.stringify(gamedata))
}
// Розпакування користувацьких даних з JSON-рядка
function getGamedataObject(JSONstring) {
	try {
		gamedata = JSON.parse(JSONstring)
		if (typeof gamedata !== 'object') gamedata = JSON.parse(gamedata)
	} catch (e) {
		simulation.defineGamedata()
	}
}
// Завантаження даних з локального сховища
function loadGamedata() {
	if (localStorage.getItem('gamedata') !== null) {
		getGamedataObject(localStorage.getItem('gamedata'))
	} else {
		if (simulation.externalURL) {
			$.ajax({
				async: false,
				type: 'POST',
				url: simulation.externalURL,
				data: false,
			}).done(
				getGamedataObject
			).fail(function(jqXHR, textStatus) {
				console.log('Завантаження не вдалося: ' + textStatus)
				simulation.defineGamedata()
			})
		} else simulation.defineGamedata() 
	}
}

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// КОНТРОЛЬНІ КНОПКИ
function setControlButtons() {
	$('#simulation-start').attr('disabled', simulation.on)
	$('#simulation-runstep').attr('disabled', !simulation.on)
	$('#simulation-autorun').attr('disabled', !simulation.on || simulation.intervalId)
	$('#simulation-stopautorun').attr('disabled', !simulation.intervalId)
	$('#simulation-finish').attr('disabled', !simulation.on)
}

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// СТАРТОВІ ДІЇ
$(function() {
	$('#simulation-start').click(simulation.initWorld)
	$('#simulation-runstep').click(simulation.runStep)
	$('#simulation-autorun').click(simulation.autoRun)
	$('#simulation-stopautorun').click(simulation.stopAutoRun)
	$('#simulation-finish').click(simulation.finishWorld)
	setControlButtons()

	$('#localstorage-save').click(saveGamedata)
	$('#localstorage-load').click(function() {
		loadGamedata()
		simulation.on = true
		setControlButtons()
	})
})

// ————————————————————————————————————————————————————————————————————————————————————————————————————
