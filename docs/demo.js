// REDZ.Phone demo: one page in five languages (?lang=); the field is rebuilt whenever a setting changes.
(function () {
	'use strict';

	const LANGS = {en: 'English', ru: 'Русский', th: 'ไทย', he: 'עברית', zh: '中文'};
	const RTL = ['he'];

	// Page texts.
	const PAGE = {
		en: {
			tagline: 'A phone field that catches a wrong number before the booking is sent. The same Google rules check it in the browser and on the server.',
			docs: 'Documentation',
			changelog: 'Changelog',
			try: 'Try it',
			try_hint: 'Type a number the way a tourist would: with or without the country code, with spaces, 0 or 00 in front, in Thai digits.',
			phone: 'Phone',
			send: 'Send',
			sent: 'Ready to send',
			fix: 'Fix the number first',
			settings: 'Settings',
			s_country: 'Default country',
			s_auto: 'From the browser language',
			s_none: 'None',
			s_types: 'Accept',
			s_mobile: 'Mobile numbers only',
			s_any: 'Any number',
			s_list: 'Country list',
			s_float: 'Drop-down',
			s_inline: 'In the page',
			s_methods: 'Ask how to contact',
			state: 'What the form gets',
			tricky: 'Tricky numbers',
			tricky_hint: 'Tap one to put it into the field.',
			use: 'Use it',
			use_hint: 'One script and one stylesheet in the browser; the server checks the number again with the same rules.',
			foot: 'MIT licence · rules: Google libphonenumber {google}',
			c_gb: 'UK mobile typed the local way',
			c_plus0: 'The same number with a stray +',
			c_wrong: 'UK mobile while Thailand is picked',
			c_oo: '00 instead of +',
			c_thai: 'Thai digits',
			c_zero: '(0) after the country code',
			c_ru: 'Russian trunk prefix 8',
			c_il: 'A range Google does not list yet',
			c_fixed: 'Thai landline where a mobile is needed',
			c_kz: '+7 that is Kazakhstan',
		},
		ru: {
			tagline: 'Поле телефона, которое ловит неверный номер до отправки заявки. В браузере и на сервере его проверяют одни и те же правила Google.',
			docs: 'Документация',
			changelog: 'Изменения',
			try: 'Попробуйте',
			try_hint: 'Наберите номер, как его набрал бы турист: с кодом страны или без, с пробелами, с 0 или 00 впереди, тайскими цифрами.',
			phone: 'Телефон',
			send: 'Отправить',
			sent: 'Можно отправлять',
			fix: 'Сначала исправьте номер',
			settings: 'Настройки',
			s_country: 'Страна по умолчанию',
			s_auto: 'По языку браузера',
			s_none: 'Не выбрана',
			s_types: 'Принимать',
			s_mobile: 'Только мобильные',
			s_any: 'Любые номера',
			s_list: 'Список стран',
			s_float: 'Выпадающий',
			s_inline: 'В потоке страницы',
			s_methods: 'Спрашивать способ связи',
			state: 'Что получит форма',
			tricky: 'Трудные номера',
			tricky_hint: 'Нажмите, чтобы подставить номер в поле.',
			use: 'Подключение',
			use_hint: 'В браузере — один скрипт и одна таблица стилей; сервер проверяет номер ещё раз по тем же правилам.',
			foot: 'Лицензия MIT · правила: Google libphonenumber {google}',
			c_gb: 'Британский мобильный, набран по-местному',
			c_plus0: 'Тот же номер с лишним +',
			c_wrong: 'Британский мобильный при выбранном Таиланде',
			c_oo: '00 вместо +',
			c_thai: 'Тайские цифры',
			c_zero: '(0) после кода страны',
			c_ru: 'Российская восьмёрка',
			c_il: 'Диапазон, которого ещё нет у Google',
			c_fixed: 'Тайский городской, а нужен мобильный',
			c_kz: '+7, но это Казахстан',
		},
		th: {
			tagline: 'ช่องกรอกเบอร์โทรที่จับเบอร์ผิดได้ก่อนส่งการจอง ทั้งเบราว์เซอร์และเซิร์ฟเวอร์ตรวจด้วยกฎชุดเดียวกันของ Google',
			docs: 'เอกสาร',
			changelog: 'ประวัติการเปลี่ยนแปลง',
			try: 'ลองใช้',
			try_hint: 'พิมพ์เบอร์แบบที่นักท่องเที่ยวพิมพ์ มีหรือไม่มีรหัสประเทศ เว้นวรรค ขึ้นต้นด้วย 0 หรือ 00 หรือใช้เลขไทย',
			phone: 'โทรศัพท์',
			send: 'ส่ง',
			sent: 'พร้อมส่ง',
			fix: 'กรุณาแก้ไขหมายเลขก่อน',
			settings: 'การตั้งค่า',
			s_country: 'ประเทศเริ่มต้น',
			s_auto: 'ตามภาษาของเบราว์เซอร์',
			s_none: 'ไม่เลือก',
			s_types: 'รับหมายเลข',
			s_mobile: 'มือถือเท่านั้น',
			s_any: 'ทุกประเภท',
			s_list: 'รายการประเทศ',
			s_float: 'แบบเลื่อนลง',
			s_inline: 'แสดงในหน้า',
			s_methods: 'ถามช่องทางการติดต่อ',
			state: 'สิ่งที่ฟอร์มได้รับ',
			tricky: 'เบอร์ที่กรอกผิดบ่อย',
			tricky_hint: 'แตะเพื่อใส่เบอร์ลงในช่อง',
			use: 'วิธีใช้',
			use_hint: 'ในเบราว์เซอร์ใช้สคริปต์หนึ่งไฟล์และสไตล์หนึ่งไฟล์ เซิร์ฟเวอร์ตรวจเบอร์ซ้ำด้วยกฎเดียวกัน',
			foot: 'สัญญาอนุญาต MIT · กฎ: Google libphonenumber {google}',
			c_gb: 'มือถืออังกฤษ พิมพ์แบบในประเทศ',
			c_plus0: 'เบอร์เดียวกันแต่มี + เกินมา',
			c_wrong: 'มือถืออังกฤษ แต่เลือกประเทศไทยไว้',
			c_oo: '00 แทน +',
			c_thai: 'เลขไทย',
			c_zero: '(0) หลังรหัสประเทศ',
			c_ru: 'เลข 8 นำหน้าแบบรัสเซีย',
			c_il: 'ช่วงเบอร์ที่ Google ยังไม่มี',
			c_fixed: 'เบอร์บ้านไทย แต่ต้องการมือถือ',
			c_kz: '+7 ที่เป็นคาซัคสถาน',
		},
		he: {
			tagline: 'שדה טלפון שתופס מספר שגוי לפני שההזמנה נשלחת. אותם כללים של Google בודקים אותו בדפדפן ובשרת.',
			docs: 'תיעוד',
			changelog: 'שינויים',
			try: 'נסו',
			try_hint: 'הקלידו מספר כמו שתייר היה מקליד: עם קידומת מדינה או בלי, עם רווחים, עם 0 או 00 בהתחלה, בספרות תאילנדיות.',
			phone: 'טלפון',
			send: 'שליחה',
			sent: 'מוכן לשליחה',
			fix: 'קודם תקנו את המספר',
			settings: 'הגדרות',
			s_country: 'מדינת ברירת מחדל',
			s_auto: 'לפי שפת הדפדפן',
			s_none: 'ללא',
			s_types: 'לקבל',
			s_mobile: 'רק מספרים ניידים',
			s_any: 'כל מספר',
			s_list: 'רשימת מדינות',
			s_float: 'רשימה נפתחת',
			s_inline: 'בתוך העמוד',
			s_methods: 'לשאול איך ליצור קשר',
			state: 'מה הטופס מקבל',
			tricky: 'מספרים מסובכים',
			tricky_hint: 'הקישו כדי להכניס את המספר לשדה.',
			use: 'שימוש',
			use_hint: 'בדפדפן — סקריפט אחד וגיליון סגנונות אחד; השרת בודק את המספר שוב לפי אותם כללים.',
			foot: 'רישיון MIT · כללים: Google libphonenumber {google}',
			c_gb: 'נייד בריטי בהקלדה מקומית',
			c_plus0: 'אותו מספר עם + מיותר',
			c_wrong: 'נייד בריטי כשנבחרה תאילנד',
			c_oo: '00 במקום +',
			c_thai: 'ספרות תאילנדיות',
			c_zero: '(0) אחרי קידומת המדינה',
			c_ru: 'קידומת 8 רוסית',
			c_il: 'טווח שעוד לא מופיע אצל Google',
			c_fixed: 'מספר קווי תאילנדי כשנדרש נייד',
			c_kz: '+7 שהוא קזחסטן',
		},
		zh: {
			tagline: '在提交预订之前就能发现错误号码的电话输入框。浏览器和服务器使用同一套 Google 规则进行检查。',
			docs: '文档',
			changelog: '更新日志',
			try: '试一试',
			try_hint: '像游客一样输入号码：带或不带国家代码、带空格、以 0 或 00 开头、或用泰文数字。',
			phone: '电话',
			send: '发送',
			sent: '可以发送',
			fix: '请先修正号码',
			settings: '设置',
			s_country: '默认国家/地区',
			s_auto: '根据浏览器语言',
			s_none: '不选择',
			s_types: '接受',
			s_mobile: '仅手机号码',
			s_any: '任何号码',
			s_list: '国家/地区列表',
			s_float: '下拉列表',
			s_inline: '在页面内展开',
			s_methods: '询问联系方式',
			state: '表单收到的内容',
			tricky: '容易出错的号码',
			tricky_hint: '点按即可填入输入框。',
			use: '使用方法',
			use_hint: '浏览器端只需一个脚本和一个样式表；服务器用相同的规则再次检查号码。',
			foot: 'MIT 许可 · 规则：Google libphonenumber {google}',
			c_gb: '按英国本地习惯输入的手机号',
			c_plus0: '同一号码多了一个 +',
			c_wrong: '选了泰国却输入英国手机号',
			c_oo: '用 00 代替 +',
			c_thai: '泰文数字',
			c_zero: '国家代码后面的 (0)',
			c_ru: '俄罗斯的长途前缀 8',
			c_il: 'Google 尚未收录的号段',
			c_fixed: '需要手机号却输入了泰国座机',
			c_kz: '+7 但属于哈萨克斯坦',
		},
	};

	// The field's own texts; English is the library default.
	const FIELD = {
		en: {},
		ru: {
			country: 'Страна',
			choose: 'Выберите страну',
			search: 'Страна или код',
			countries: 'Страны',
			nothing: 'Ничего не найдено',
			example: 'Пример: {example}',
			empty: 'Введите номер телефона',
			no_country: 'Выберите страну или начните номер с +',
			too_short: 'Слишком короткий номер для страны «{country}».',
			too_long: 'Слишком длинный номер для страны «{country}».',
			invalid: 'Номер не подходит для страны «{country}».',
			bad_code: 'Проверьте код страны.',
			wrong_type: 'Нужен мобильный номер.',
			unallocated: 'Необычный номер для страны «{country}». Проверьте его.',
			confirm: 'Номер верный',
			methods: 'Как с вами связаться?',
			method: 'Выберите способ связи',
			call: 'Звонок',
		},
		th: {
			country: 'ประเทศ',
			choose: 'เลือกประเทศ',
			search: 'ประเทศหรือรหัส',
			countries: 'ประเทศ',
			nothing: 'ไม่พบ',
			example: 'ตัวอย่าง: {example}',
			empty: 'กรอกหมายเลขโทรศัพท์',
			no_country: 'เลือกประเทศ หรือขึ้นต้นหมายเลขด้วย +',
			too_short: 'หมายเลขสั้นเกินไปสำหรับ {country}',
			too_long: 'หมายเลขยาวเกินไปสำหรับ {country}',
			invalid: 'หมายเลขไม่ถูกต้องสำหรับ {country}',
			bad_code: 'ตรวจสอบรหัสประเทศ',
			wrong_type: 'กรุณากรอกหมายเลขมือถือ',
			unallocated: 'หมายเลขนี้ดูไม่ปกติสำหรับ {country} กรุณาตรวจสอบ',
			confirm: 'หมายเลขถูกต้อง',
			methods: 'ให้ติดต่อคุณทางไหน',
			method: 'เลือกช่องทางการติดต่อ',
			call: 'โทร',
		},
		he: {
			country: 'מדינה',
			choose: 'בחרו מדינה',
			search: 'מדינה או קידומת',
			countries: 'מדינות',
			nothing: 'לא נמצא',
			example: 'לדוגמה: {example}',
			empty: 'הזינו מספר טלפון',
			no_country: 'בחרו מדינה או התחילו את המספר ב-+',
			too_short: 'המספר קצר מדי עבור {country}.',
			too_long: 'המספר ארוך מדי עבור {country}.',
			invalid: 'המספר אינו תקין עבור {country}.',
			bad_code: 'בדקו את קידומת המדינה.',
			wrong_type: 'הזינו מספר נייד.',
			unallocated: 'המספר נראה חריג עבור {country}. אנא בדקו אותו.',
			confirm: 'המספר נכון',
			methods: 'איך ליצור איתך קשר?',
			method: 'בחרו דרך ליצירת קשר',
			call: 'שיחה',
		},
		zh: {
			country: '国家/地区',
			choose: '选择国家/地区',
			search: '国家/地区或区号',
			countries: '国家/地区',
			nothing: '未找到',
			example: '示例：{example}',
			empty: '请输入电话号码',
			no_country: '请选择国家/地区，或以 + 开头输入号码',
			too_short: '对{country}来说号码太短。',
			too_long: '对{country}来说号码太长。',
			invalid: '不是有效的{country}号码。',
			bad_code: '请检查国家/地区代码。',
			wrong_type: '请输入手机号码。',
			unallocated: '这个{country}号码不常见，请检查。',
			confirm: '号码正确',
			methods: '我们如何联系您？',
			method: '请选择联系方式',
			call: '电话',
		},
	};

	const CASES = [
		['c_gb', '07400 123456', 'GB'],
		['c_plus0', '+07400123456', 'GB'],
		['c_wrong', '07400 123456', 'TH'],
		['c_oo', '0044 7911 123456', 'TH'],
		['c_thai', '๐๘๑ ๒๓๔ ๕๖๗๘', 'TH'],
		['c_zero', '+44 (0) 7911 123456', 'TH'],
		['c_ru', '8 916 123-45-67', 'RU'],
		['c_il', '050-123-4567', 'IL'],
		['c_fixed', '02 123 4567', 'TH'],
		['c_kz', '+7 701 123 4567', 'RU'],
	];
	const COUNTRIES = ['TH', 'GB', 'RU', 'IL', 'CN', 'US', 'DE'];
	const METHODS = {call: 'Call', whatsapp: 'WhatsApp', telegram: 'Telegram', line: 'LINE'};

	const query = new URLSearchParams(location.search).get('lang');
	const lang = LANGS[query] ? query : (Object.keys(LANGS).find((l) => (navigator.language || '').toLowerCase().startsWith(l)) || 'en');
	const P = PAGE[lang];
	const byId = (id) => document.getElementById(id);
	const regionName = (() => {
		try {
			const names = new Intl.DisplayNames([lang, 'en'], {type: 'region'});
			return (iso) => names.of(iso) || iso;
		} catch {
			return (iso) => iso;
		}
	})();

	document.documentElement.lang = lang;
	document.documentElement.dir = RTL.includes(lang) ? 'rtl' : 'ltr';
	document.querySelectorAll('[data-t]').forEach((node) => {
		node.textContent = P[node.dataset.t];
	});

	Object.entries(LANGS).forEach(([code, name]) => {
		const a = document.createElement('a');
		a.href = `?lang=${code}`;
		a.lang = code;
		a.textContent = name;
		if (code === lang) {
			a.setAttribute('aria-current', 'true');
		}
		byId('langs').append(a);
	});

	const option = (select, value, text) => {
		const o = document.createElement('option');
		o.value = value;
		o.textContent = text;
		select.append(o);
	};
	option(byId('s-country'), 'auto', P.s_auto);
	option(byId('s-country'), '', P.s_none);
	COUNTRIES.forEach((iso) => option(byId('s-country'), iso, regionName(iso)));
	option(byId('s-types'), 'MOBILE', P.s_mobile);
	option(byId('s-types'), '', P.s_any);
	option(byId('s-list'), 'float', P.s_float);
	option(byId('s-list'), 'inline', P.s_inline);

	const input = byId('phone');
	const demo = {field: null};
	window.demo = demo;

	function build() {
		demo.field?.destroy();
		demo.field = window.REDZ.Phone.field(input, {
			country: byId('s-country').value,
			popular: ['TH', 'GB', 'RU', 'CN', 'US'],
			types: byId('s-types').value ? [byId('s-types').value] : [],
			list: byId('s-list').value,
			methods: byId('s-methods').checked ? Object.keys(METHODS) : [],
			methodRequired: byId('s-methods').checked,
			texts: FIELD[lang],
			hidden: {country: 'phone_country', method: 'contact'},
		});
		byId('sent').hidden = true;
	}

	input.addEventListener('redzphone', (e) => {
		byId('state').textContent = JSON.stringify(e.detail, null, 2);
	});
	['s-country', 's-types', 's-list', 's-methods'].forEach((id) => byId(id).addEventListener('change', build));

	byId('demo-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const s = demo.field.check();
		const sent = byId('sent');
		sent.hidden = false;
		sent.className = s.valid ? 'sent is-ok' : 'sent is-bad';
		sent.textContent = s.valid ? `${P.sent}: ${s.result ? s.result.e164 : s.input}${s.method ? ` · ${FIELD[lang][s.method] || METHODS[s.method]}` : ''}` : P.fix;
		if (!s.valid) {
			input.focus();
		}
	});

	CASES.forEach(([key, value, iso]) => {
		const li = document.createElement('li');
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'case';
		const number = document.createElement('span');
		number.className = 'case-number';
		number.dir = 'ltr';
		number.textContent = value;
		const where = document.createElement('span');
		where.className = 'case-where';
		where.textContent = regionName(iso);
		const what = document.createElement('span');
		what.className = 'case-what';
		what.textContent = P[key];
		b.append(number, where, what);
		b.addEventListener('click', () => {
			demo.field.set(value, iso);
			demo.field.check();
			input.scrollIntoView({block: 'center', behavior: 'smooth'});
		});
		li.append(b);
		byId('cases').append(li);
	});

	const foot = document.createElement('span');
	foot.textContent = `REDZ.Phone ${window.REDZ.Phone.version} · ${P.foot.replace('{google}', window.REDZ.Phone.google)}`;
	byId('foot').append(foot);

	build();
})();
