"use strict";

/**
 * Функция вывода картинок в виде мозайки.
 *
 * @param {string} wrapper Класс обертки.
 * @param {string} container Класс картинок.
 * @param {number} wBorder Суммарная ширина планируемых бордюров слева и справа от картинки.
 * @param {mixed} wImgAverage Средняя ширина картинки в линии.
 *                Если массив то, каждое его значение представляет кол-во картинок в линии.
 *                Если false, мозайка будет выводится по принципу 2-3.
 * @param {number} smallHeight Высота картинки, ниже которой добавляется класс small-height
 * @return {undefined}
 */
let tGal = (function($) {
	return function(wrapper = '.tgal', container = '.tgal img', wBorder = 0, wImgAverage = false, smallHeight = 200) {
		let i = 0; // счетчик всех картинок
		let nLine = 1; // текущий номер линии
		let iLine = 0; // счетчик картинок в линии
		let wLine = 0; // текущая ширина линии
		let cLine = 1; // кол-во картинок в линии
		let minHeghtLine = 9999; // минимальная высота картинки в линии
		
		// вычислить ширину галереи
		let wGal = $(wrapper).width();
		// вычислить общее кол-во картинок
		let cImg = $(container).length;
		
		// цикл по картинкам
		$(container).each(function() {
			let el = $(this);
			// счетчики
			i = i + 1;
			iLine = iLine + 1;

			// вычислить кол-во картинок в линии
			switch (typeof wImgAverage) {
				case 'number':
					cLine = Math.ceil(wGal / wImgAverage);
					break;
				case 'object':
					if (Array.isArray(wImgAverage)) {
						let lengthScheme = wImgAverage.length;
						let indexScheme = nLine - 1;
						if (indexScheme >= lengthScheme) {
							indexScheme = indexScheme % lengthScheme;
						}
						cLine = wImgAverage[indexScheme];
						break;
					}
				default:
					cLine = nLine % 2 ? 2 : 3;
			}
			
			// попытка считать data-tgal-width и data-tgal-height
			let curW = el.data('tgal-width');
			let curH = el.data('tgal-height');
			// вычислить размеры картинки
			if (curW === undefined || !curW) {
				curW = el.width();
				el.data('tgal-width', curW);
			}
			if (curH === undefined || !curH) {
				curH = el.height();
				el.data('tgal-height', curH);
			}

			// проверка загрузки всех картинок, в конце сделать пересчет мозайки еще раз
			if (!curW || !curH) {
				el.addClass('not-loaded').one('load', function(){
					$(this).removeClass('not-loaded');
					if (!$('.not-loaded').length) tGal(wrapper, container, wBorder, wImgAverage, smallHeight);
				});
			}
			
			// если высота текущей картинки меньше минимальной
			let kH;
			if (curH < minHeghtLine) {
				// коэфициент, на который уменьшена минимальная высота
				kH = minHeghtLine / curH;
				// запись мин. высоты
				minHeghtLine = curH;
				// уменьшить ширину строки на kH
				wLine = wLine / kH;
			} else {
				// коэфициент, на который уменьшена высота картинки
				kH = curH / minHeghtLine;
				// вычислить ширину картинки с учетом уменьшения
				curW = curW / kH;
			}
			
			// прибавить к ширине строки текущую ширину картинки
			wLine = wLine + curW;
			
			// удалить старый класс линии, если есть
			el.removeClass(function(index, cls) {
				let mask = 'tgal-line-*';
				let re = mask.replace(/\*/g, '\\S+');
				return (cls.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
			});

			// добавить класс с номером линии текущей картинке и родителю
			el.addClass('tgal-line-'+nLine);
			el.parent().addClass('tgal-line-wrap-'+nLine);

			// если строка заполнена
			if (iLine == cLine || cImg == i) {
				// кооф, на сколько линия больше ширины галереи // вычесть бордюры картинок * кол-во картинок в линии
				let kL = wLine / (wGal - (wBorder * iLine));
				// вычислить нужную высоту линии
				let hLine = minHeghtLine / kL;
				// задать картинкам высоту линии
				let currentImages = $('.tgal-line-'+nLine);
				currentImages.css('height', hLine+'px');
				let currentBlocks = currentImages.parent();
				currentBlocks.css('max-height', hLine+'px');
				if (hLine < smallHeight) {
					currentBlocks.addClass('small-height');
				} else {
					currentBlocks.removeClass('small-height');
				}
				// сброс счетчика картинок в линии
				iLine = 0;
				// сброс ширины линии
				wLine = 0;
				// сброс минимальной высоты картинки
				minHeghtLine = 9999;
				// переход на следующию линию
				nLine = nLine + 1;
			}
		});
	}
})(jQuery);