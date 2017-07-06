// Author: Oleksa Vysnivsky a.k.a. ODE
// Email: me@ovyshnivsky.pp.ua
// ————————————————————————————————————————————————————————————————————————————————————————————————————
// Допоміжні змінні
var tribes = [
	'Уличі',
	'Тиверці',
	'Бужани',
	'Дуліби',
	'Волиняни',
	'Білі хорвати',
	'Деревляни',
	'Поляни',
	'Сіверяни'
]

// ————————————————————————————————————————————————————————————————————————————————————————————————————

// ГОЛОВНИЙ ОБ’ЄКТ
function defineGamedata() {
	gamedata = {
		curSeason: 0,	// Поточний сезон
		tribes: [],	// Племена (характеристики — нижче)
		state: {	// Держава
			treasury: 0,
			taxrate: 0.1,
			population: 0,
			lastTax: 0,
			lastDotation: 0
		}
	}

	// Племена
	tribes.forEach(function(tribe) {
		gamedata.tribes.push({
			name: tribe,
			treasury: 0,
			population: 10,
			taxrate: gamedata.state.taxrate,
			lastTax: '',
			lastDotation: '',
		})
	})

	gamedata.tribes.forEach(function(tribe, i) {
		var html = $('<tr class="tribe-' + i + '"><td>' + tribe.name + '<td class="text-right population"><td class="text-right treasury"><td class="text-right lastTax"><td class="text-right lastDotation">')
		$('#table-tribes tbody').append(html)
	})
}

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// Крок світу
function runStep() {
	gamedata.curSeason++
	$('#curSeason').text(gamedata.curSeason)

	gamedata.state.lastTax = 0
	gamedata.state.lastDotation = 0
	gamedata.state.population = 0

	// Утримання, продуктивність, податки
	gamedata.tribes.forEach(function(tribe) {
		if (tribe.population < 1) return true

		// Додана вартість, створена племенем у цьому сезоні
		var production = randomIntFromInterval(0, 100)
		// Приріст населення
		tribe.population += Math.round(production / 50)
		// Утримання племені
		var maintenance = tribe.population
		// Податок
		// var tax = production > maintenance ? Math.round((production - maintenance) * gamedata.state.taxrate) : 0
		var tax = Math.round(production * gamedata.state.taxrate)
		// Скарбниці
		gamedata.state.treasury += tax
		tribe.treasury += production - maintenance - tax

		gamedata.state.lastTax += tax
		tribe.lastTax = tax
	})

	// Дотації
	gamedata.tribes.forEach(function(tribe) {
		if (tribe.population < 1) return true

		if (tribe.treasury < 0) {
			// Дотація
			if (gamedata.state.treasury > -tribe.treasury) {
				var amount = -tribe.treasury
				gamedata.state.treasury -= amount
				tribe.treasury += amount

				tribe.lastDotation = amount
				gamedata.state.lastDotation += amount
			} else if (gamedata.state.treasury > 0) {
				var amount = gamedata.state.treasury
				gamedata.state.treasury -= amount
				tribe.treasury += amount

				tribe.lastDotation = amount
				gamedata.state.lastDotation += amount
			} else {
				tribe.lastDotation = 0
			}
		}

		// Падіння населення
		if (tribe.treasury < 0) {
			tribe.population += tribe.treasury
			tribe.treasury = 0
			if (tribe.population < 0) tribe.population = 0
		}

		// Сумарне населення 
		gamedata.state.population += tribe.population
	})

	gamedata.tribes.forEach(function(tribe, i) {
		$('.tribe-' + i + ' .population').text(tribe.population)
		$('.tribe-' + i + ' .treasury').text(tribe.treasury)
		$('.tribe-' + i + ' .lastTax').text(tribe.lastTax)
		$('.tribe-' + i + ' .lastDotation').text(tribe.lastDotation)
	})
	$('.state .population').text(gamedata.state.population)
	$('.state .treasury').text(gamedata.state.treasury)
	$('.state .lastTax').text(gamedata.state.lastTax)
	$('.state .lastDotation').text(gamedata.state.lastDotation)

	makeChart(gamedata.state.population, gamedata.state.treasury)
}

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// Допоміжні функції
function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

// Читання налаштувань
function readSettings() {
	
}

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// СТАРТОВІ ДІЇ
$(function() {
	$('#taxrate').change(function() {
		gamedata.state.taxrate = parseFloat($('#taxrate').val())
	})
})

// ————————————————————————————————————————————————————————————————————————————————————————————————————
// ГРАФІК
var xData = ['x', 0]
var yData1 = ['Населення', 0]
var yData2 = ['Скарбниця', 0]
var chart = c3.generate({
	bindto: '#chart',
	data: {
		x: 'x',
		columns: [
			xData,
			yData1,
			yData2
		]
	},
})
var chartPoints = 25
function makeChart(population, treasury) {
	if (xData.length > chartPoints) xData.splice(1, 1)
	if (yData1.length > chartPoints) yData1.splice(1, 1)
	if (yData2.length > chartPoints) yData2.splice(1, 1)
	xData.push(gamedata.curSeason)
	yData1.push(population)
	yData2.push(treasury)
	chart.load({
		x: xData,
		columns: [
			xData,
			yData1,
			yData2
		]
	})
}
