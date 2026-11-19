// Each bracket contains the cue, accepted answers separated by ~, and the explanation.
function gapRows(text) {
  return text.trim().split('\n').map(line => {
    const [reference, prompt, ru] = line.split('|');
    return {reference, prompt, ru, gaps: [...prompt.matchAll(/\[([^\]]+)\]/g)].map(match => {
      const [cue, answers, explanation] = match[1].split(';');
      return {cue, answers: answers.split('~'), explanation};
    })};
  });
}

function choices(topic, text) {
  const original = exercises[topic] ?? [];
  if (!text) return original.map(([prompt, ru, reference, options]) => ({prompt, ru, reference, options}));
  return text.trim().split('\n').map(line => {
    const [reference, prompt, ru, right, wrong, yes, no, other, otherNote] = line.split('|');
    const existing = original.find(task => task[2] === reference);
    if (existing) {
      const [prompt, ru, reference, options] = existing;
      return {prompt, ru, reference, options};
    }
    const options = [[right, '', yes, true], [wrong, '', no, false]];
    if (other) options.push([other, '', otherNote, false]);
    return {prompt, ru, reference, options: /[acegi]$/.test(reference) ? options : options.reverse()};
  });
}

const pictureCaptions = [
  ['When he left the house, Peter forgot that he had put his passport and wallet in his other jacket.', 'Выходя из дома, Питер забыл, что положил паспорт и кошелёк в другой пиджак.', 4, 'Питер выходит из дома с сумкой.'],
  ['After phoning the airport, Peter packed his suitcase.', 'Позвонив в аэропорт, Питер собрал чемодан.', 3, 'Питер складывает вещи в багаж после звонка.'],
  ['When he returned from Portugal in March, Peter put his passport and wallet in his jacket pocket.', 'Когда Питер вернулся из Португалии в марте, он положил паспорт и кошелёк в карман пиджака.', 1, 'Видно, как Питер кладёт документы в карман пиджака.'],
  ['A few days before leaving for his summer holiday, Peter phoned the airport to check his flight.', 'За несколько дней до летнего отпуска Питер позвонил в аэропорт, чтобы уточнить данные рейса.', 2, 'Питер разговаривает по телефону и смотрит в бумаги.'],
  ['While Peter was packing his suitcase, he realized that he hadn’t checked his flight.', 'Собирая чемодан, Питер понял, что не уточнил данные рейса.', 0, 'На рисунках показаны действия. Такого момента осознания на них не видно.'],
  ['While Peter was packing his suitcase, the phone rang.', 'Когда Питер собирал чемодан, зазвонил телефон.', 0, 'На сцене со сбором вещей звонок не показан.'],
];

const fullPractice = {
present: [
  {title:'Выбор между Present Simple и Present Continuous', items:choices('present', `
1a|What sort of work ___?|Чем ты занимаешься по работе?|do you do|are you doing|Вопрос о роде занятий в целом: Present Simple.|Continuous был бы естественен при вопросе о работе в данный момент.
1b
1c
1d
1e
1f|Follow that bus. Then you ___ left.|Поезжай за этим автобусом. Потом поверни налево.|turn|are turning|В инструкциях последовательность шагов можно описать в Present Simple.|Continuous описывал бы поворот в процессе.
1g
1h
1i|___ for the bus to Newcastle?|Ты ждёшь автобус до Ньюкасла?|Are you waiting|Do you wait|Вопрос о том, что человек делает сейчас.|Present Simple спрашивал бы о привычке.
1j|Andy ___ his own house in the country.|Энди строит себе дом за городом.|is building|builds|Строительство конкретного дома подаётся как временный проект.|Present Simple подошёл бы при описании обычной деятельности.
`)},
  {title:'Поставить глаголы в настоящее время', items:gapRows(`
2a|There’s nobody here, and the door’s locked. What [we do;are we doing~do we do;Do we do — вопрос о дальнейших действиях. Are we doing — вопрос о том, чем мы сейчас занимаемся.] now?|Здесь никого нет, и дверь заперта. Что нам теперь делать?
2b|What [you look;are you looking;Взгляд в данный момент: Present Continuous.] at? [I wear;Am I wearing;Вопрос об одежде, которая сейчас на говорящем.] the wrong clothes?|На что ты смотришь? Я одет неподходяще?
2c|Who [drive;drives;По припаркованной машине спрашивают о том, кто обычно ею пользуется.] the Mercedes that’s parked outside?|Кто ездит на «Мерседесе», который припаркован снаружи?
2d|I [still have;still have;Have здесь означает наличие боли, состояние.] a pain in my leg but it [get;is getting;Состояние постепенно меняется.] better.|У меня всё ещё болит нога, но становится лучше.
2e|Who [Sue dance;is Sue dancing;Танец происходит прямо сейчас.] with? That’s not her brother, is it?|С кем танцует Сью? Это ведь не её брат?
2f|Harry always [look;looks;Always указывает на обычный внешний вид.] untidy! He [wear;wears~is wearing;Wears описывает привычку, is wearing — одежду на нём сейчас.] dirty jeans.|Гарри всегда выглядит неряшливо! Он носит грязные джинсы.
2g|I [write;am writing;Действие происходит в момент составления письма.] in reply to your advertisement in the Daily News.|Пишу в ответ на ваше объявление в Daily News.
2h|That plant I bought [not grow;is not growing;Рост растения в текущий период.] very much. And I [water;water;Every day показывает привычку.] it every day.|То растение, которое я купил, почти не растёт. А я поливаю его каждый день.
2i|Which hotel [you stay;do you stay~are you staying;Simple спрашивает об обычном выборе, Continuous — о договорённости на конкретный приезд.] in when you [come;come;После when ставим настоящее, даже если речь о предстоящем приезде.] here?|В каком отеле ты останавливаешься, когда приезжаешь сюда?
`)},
  {title:'Письмо тёте Джин', passage:true, items:gapRows(`
3.1–3|Dear Aunt Jean, I [just write;am just writing;Действие происходит в момент написания.] to tell you how much I [appreciate;appreciate;Appreciate здесь выражает отношение.] the money you sent me, and to tell you how I [get on;am getting on;Текущие успехи в первом семестре.] in my first term at university.|Дорогая тётя Джин! Пишу, чтобы сказать, как я благодарна за присланные деньги, и рассказать, как у меня дела в первом семестре в университете.
3.4–6|Actually, I [really enjoy;am really enjoying;Речь о впечатлениях в текущем семестре.] myself! I [study;am studying~study;Процесс в этом семестре или общее описание того, как она учится.] quite hard as well, but at the moment I [spend;am spending;At the moment указывает на текущий период.] a lot of time just making friends.|Вообще мне очень нравится! Я также усердно учусь, но сейчас много времени уделяю новым знакомствам.
3.7–10|I [still stay;am still staying;Временное жильё.] with my friend Sue, and I [look for;am looking for;Поиски идут сейчас.] somewhere of my own to live. Only a few of the first-year students [live;live;Общая ситуация с проживанием студентов.] in college here, and I [seem;seem;Seem выражает впечатление.] to be spending a lot of time travelling backwards and forwards.|Я всё ещё живу у подруги Сью и подыскиваю себе жильё. Лишь несколько первокурсников живут при колледже, а я, кажется, трачу много времени на поездки туда и обратно.
3.11–13|I [go;go;Every morning — регулярное действие.] to lectures every morning, and most afternoons I [study;study;Most afternoons — распорядок.] in the library. In fact I [write;am writing;Письмо пишется в этот момент.] this letter instead of an essay on Hamlet!|По утрам я хожу на лекции, а после обеда обычно занимаюсь в библиотеке. Вообще-то сейчас я пишу это письмо вместо сочинения о «Гамлете»!
3.14–17|I [think;think;Think вводит мнение.] I’ll buy some new clothes with the money you sent. Everything [cost;costs;Cost показывает стоимость, состояние.] a lot here, and I [save;am saving;Героиня сейчас копит на конкретную покупку.] to buy a winter coat. It [get;gets;In the evening описывает регулярное похолодание.] really cold here in the evening.|Думаю, я куплю себе одежду на присланные деньги. Здесь всё дорого, и я коплю на зимнее пальто. По вечерам здесь очень холодно.
3.18–20|I now [know;know;Know выражает знание и знакомство.] some other students and generally speaking we [have;have~are having;Have a good time допускает обе формы: общая оценка или текущий период.] quite a good time socially! I [also learn;am also learning;Она осваивает вождение в текущий период.] to drive. See you soon. Katherine.|Теперь я знакома с другими студентами, и в целом мы неплохо проводим время! Ещё я учусь водить. До встречи. Кэтрин.
`)},
],
past: [
  {title:'Сопоставить картинки и описания', image:'past-pictures.png', items:[1,2,3,4].map(number => ({
    reference:'1.'+number, prompt:'Picture '+number, ru:'Рисунок '+number,
    options:pictureCaptions.map(([text, ru, answer, note]) => [text,ru,note,answer === number]),
  }))},
  {title:'Выбрать форму прошедшего времени', items:choices('past', `
2a
2b
2c
2d|Who ___ the car at the time of the accident?|Кто был за рулём в момент аварии?|was driving|drove|Имеется в виду процесс в момент аварии.|Past Simple представлял бы поездку как отдельное событие.
2e
2f|David ___ Japanese food before, so he knew what to order.|Дэвид раньше ел японскую еду, поэтому знал, что заказать.|had eaten|ate|Опыт предшествовал моменту выбора блюда.|Past Simple не так явно показывает порядок этих событий.
2g
2h|I ___ sweets much more than I do now.|Раньше я любил сладкое гораздо больше, чем сейчас.|used to like|was liking|Used to подчёркивает отличие прежнего состояния от нынешнего.|Like здесь выражает предпочтение, Continuous для него в таком контексте не подходит.
2i|What exactly ___ when I came into your office yesterday?|Что именно ты делал, когда я вчера вошёл к тебе в кабинет?|were you doing|did you do|Спрашивают о процессе, который уже шёл в момент входа.|Past Simple подходил бы для отдельного действия, например реакции на появление говорящего.
2j|Laura missed the party because no one ___ her about it.|Лора пропустила вечеринку, потому что ей никто о ней не сказал.|had told|was telling|Сообщение должно было произойти раньше вечеринки.|Continuous передавал бы процесс в момент в прошлом.
2k
`)},
  {title:'Заполнить пропуски в прошедшем времени', items:gapRows(`
3a|While I [try;was trying;Попытки запустить машину служат фоном.] to get my car started, a passing car [stop;stopped;Машина остановилась — отдельное событие.] and the driver [offer;offered;Предложение помощи — следующее событие.] to help me.|Пока я пытался завести машину, проезжавший автомобиль остановился и водитель предложил помочь.
3b|The police [pay;paid;Past Simple передаёт реакцию полиции.] no attention to Clare’s complaint because she [phone;had phoned;Предыдущие звонки произошли до жалобы.] them so many times before.|Полиция не обратила внимания на жалобу Клэр, потому что она уже много раз им звонила.
3c|Mary [not wear;was not wearing;В тот момент Мэри была без очков.] her glasses at the time, so she [not notice;did not notice;Она не заметила — результат в прошлом.] what kind of car the man [drive;was driving;Мужчина был в процессе езды.].|На Мэри тогда не было очков, так что она не заметила, какой машиной управлял мужчина.
3d|Nick [lie;lay;Он прилёг — основное событие.] down on the grass for a while, next to some tourists who [feed;were feeding;Кормление уток — фон.] the ducks.|Ник ненадолго прилёг на траву рядом с туристами, которые кормили уток.
3e|Tony [admit;admitted;Признание — основное событие.] that he [hit;had hit~hit;Столкновение предшествовало признанию. Past Simple тоже возможен, поскольку порядок ясен.] the other car, but said that he [not damage;had not damaged~did not damage;Отрицание относится к последствиям столкновения до разговора.] it.|Тони признал, что задел другую машину, но сказал, что не повредил её.
3f|Sorry, I [not listen;was not listening;Речь о только что шедшем разговоре.] to you. I [think;was thinking;Это параллельный мысленный процесс.] about something else.|Извини, я тебя не слушал. Я думал о другом.
3g|Helen [feel;felt~was feeling;Simple передаёт состояние, Continuous подчёркивает временное самочувствие.] very tired, and when she [finish;finished~had finished;When позволяет передать последовательность. Past Perfect дополнительно подчёркивает завершение.] her work, she [fall;fell;Засыпание — следующее событие.] asleep.|Хелен очень устала и, закончив работу, уснула.
3h|The police [get;got;Прибытие — основное событие.] to Clare’s house as fast as they could, but the burglars [disappear;had disappeared;Воры скрылись до прибытия полиции.].|Полиция добралась до дома Клэр как можно быстрее, но грабители уже скрылись.
3i|I [phone;phoned;Конкретный завершённый момент: last night.] you last night but you [not answer;did not answer;Отсутствие ответа — результат звонка.]. What [you do;were you doing;Вопрос о том, чем человек был занят во время звонка.]?|Я звонил тебе вчера вечером, но ты не ответил. Что ты делал?
3j|We [not go;did not go;Yesterday указывает на завершённое прошлое.] out yesterday because it [rain;was raining;Дождь служит фоном и причиной.].|Вчера мы не выходили, потому что шёл дождь.
`)},
  {title:'История экспедиции в Гималаи', passage:true, items:gapRows(`
4.1–4|When Professor Mallory, the famous archaeologist, [invite;invited;Приглашение задаёт момент рассказа.] me to take part in his expedition to find the Lost City of the Himalayas, I [not hesitate;did not hesitate;Моя реакция — основное событие.] to accept his invitation. Mallory [discover;had discovered;Карта была найдена до приглашения.] an ancient map showing the position of the city, although no European [ever go;had ever gone~had ever been;Речь об отсутствии такого опыта до рассматриваемого момента.] to the area before.|Когда известный археолог профессор Мэллори пригласил меня в экспедицию на поиски затерянного города Гималаев, я согласился без колебаний. Мэллори обнаружил древнюю карту с местоположением города, хотя раньше в тех краях не бывал ни один европеец.
4.5–9|In fact, most of Mallory’s colleagues either [believe;believed;Мнение коллег в прошлом.] that the city [never exist;had never existed~never existed;Существование города рассматривается до момента этих убеждений.] or [feel;felt;Мнение коллег в прошлом.] that it [vanish;had vanished;Город исчез до обсуждаемых событий.] long ago and [become;had become~become;Действие более раннее. Had можно разделить с предыдущей формой: had vanished and become.] simply a legend.|Большинство коллег Мэллори считали, что город либо никогда не существовал, либо давно исчез и стал легендой.
4.10–12|According to the Professor, the builders of the city [hide;had hidden~hid;Строители спрятали город задолго до экспедиции.] it among the mountains in order to protect its immense riches. He [believe;believed;Прошлое убеждение.] that the descendants of these ancient people [still keep;still kept~were still keeping;Продолжавшееся тогда обособление.] themselves apart from the rest of mankind for the very same reasons.|По мнению профессора, строители спрятали город в горах, чтобы защитить его огромные богатства. Он считал, что потомки этих людей всё ещё держались в стороне от остального человечества по той же причине.
4.13–16|So when we [set off;set off;Отправление — основное событие.] on a cool May morning towards the distant mountains, each of us [look forward;was looking forward~looked forward;Ожидание сопровождает начало экспедиции.] to exciting discoveries. For a week or more we [climb;climbed~were climbing;Можно показать подъём как отрезок повествования или как процесс.] higher and higher, following the map, which Mallory [study;studied~was studying;From time to time описывает повторявшееся изучение карты.] from time to time.|Мы отправились прохладным майским утром к далёким горам, предвкушая открытия. Больше недели мы поднимались всё выше, сверяясь с картой, которую Мэллори время от времени изучал.
4.17–20|Then one afternoon, while we [rest;were resting;Отдых — фон для события.] at the top of a valley, we [notice;noticed;То, что заметили путника, — отдельное событие.] that a rider on a horse [wave;was waving;Всадник уже махал, когда его заметили.] at us from the other side of the valley. A rider whose clothes [shine;were shining~shone;Блеск одежды — часть описания увиденной сцены.] like gold!|Однажды днём, отдыхая над долиной, мы заметили, что с противоположной стороны нам машет всадник. Его одежда сияла как золото!
`)},
  {title:'Переписать предложения с before, after или while', items:gapRows(`
5a|Norman collected the parcel, but then he realized it was the wrong one. After [rewrite the sentence;collecting the parcel, Norman realized it was the wrong one~collecting the parcel, Norman realized that it was the wrong one;Общий субъект Norman позволяет после after оставить collecting.]|Норман забрал посылку, но потом понял, что она не та.
5b|Sue left the house but first she checked that she had her keys. Before [rewrite the sentence;leaving the house, Sue checked that she had her keys~leaving the house, Sue checked she had her keys;Before leaving обозначает действие, до которого Сью проверила ключи.]|Сью вышла из дома, но сначала проверила, что ключи при ней.
5c|Mark was parking his car when he noticed the wing-mirror was broken. While [rewrite the sentence;parking his car, Mark noticed the wing-mirror was broken~parking his car, Mark noticed that the wing-mirror was broken;While parking передаёт действие, во время которого Марк заметил поломку.]|Паркуя машину, Марк заметил, что боковое зеркало сломано.
5d|Julia cleaned the house, but then she fell asleep on the sofa. After [rewrite the sentence;cleaning the house, Julia fell asleep on the sofa;After cleaning ставит уборку раньше сна.]|Джулия убралась в доме, а потом заснула на диване.
5e|Brian bought a new television, but first he checked all the prices. Before [rewrite the sentence;buying a new television, Brian checked all the prices;Before buying ставит проверку цен раньше покупки.]|Брайан купил новый телевизор, но сначала проверил все цены.
5f|Alan was skiing in Switzerland and met his old friend, Ken. While [rewrite the sentence;skiing in Switzerland, Alan met his old friend, Ken;While skiing задаёт фон для встречи.]|Катаясь на лыжах в Швейцарии, Алан встретил старого друга Кена.
5g|Kate took two aspirins, and then she felt a lot better. After [rewrite the sentence;taking two aspirins, Kate felt a lot better;After taking указывает, что Кейт стало лучше после приёма таблеток.]|Кейт приняла две таблетки аспирина, и ей стало гораздо лучше.
5h|Sheila went out for the evening, but first she washed her hair. Before [rewrite the sentence;going out for the evening, Sheila washed her hair;Before going out ставит мытьё волос раньше выхода.]|Шейла ушла вечером из дома, но сначала вымыла голову.
`)},
],
perfect: [
 {title:'Выбрать форму глагола',items:[
  ...choices('perfect',`
1a
1b
1c|From the minute he got up this morning Gary ___ silly questions!|С той минуты, как Гэри встал утром, он задаёт глупые вопросы!|has been asking|asked|Повторяющееся действие продолжается с утра. Continuous подчёркивает процесс.|Asked обозначало бы завершённый период в прошлом.|has asked|Has asked подходит, когда важны отдельные случаи или результат. Здесь восклицание подчёркивает непрерывное повторение.
`),
 {reference:'1d',prompt:'[give;Did you give;Речь о конкретной встрече с Хелен в прошлом.] Helen my message when you [see;saw;When вводит обстоятельство прошлой встречи.] her?',ru:'Ты передал Хелен моё сообщение, когда увидел её?',gaps:[{cue:'give',answers:['Did you give'],explanation:'Did you give относится к конкретной встрече.',variants:['Did you give','Have you given'],rejected:'Have you given подходит для результата к настоящему без ссылки на конкретную прошлую встречу.'},{cue:'see',answers:['saw'],explanation:'Saw обозначает конкретную встречу в прошлом.',variants:['have seen','saw'],rejected:'Have seen здесь не подходит: when указывает на момент той встречи.'}]},
 ...choices('perfect',`
1e|Sorry, could you say that again? I ___ to you.|Извини, можешь повторить? Я не слушал тебя.|haven’t been listening|haven’t listened|Present Perfect Continuous подчёркивает, что до этой минуты человек был невнимателен.|Simple здесь звучит как сообщение об отсутствии опыта или результата, а нужна причина просьбы повторить.|didn’t listen|Past Simple возможен, если разговор воспринимается как завершённый эпизод. Здесь Continuous лучше подчёркивает невнимательность до текущей реплики.
1f|The police think that they ___ your wallet, so call this number.|Полиция думает, что нашла твой кошелёк, так что позвони по этому номеру.|have found|found|Находка важна сейчас: можно позвонить в полицию.|Found естественен при рассказе о находке в прошлом, особенно с указанием времени.
1g
1h|___ anyone interesting at the reception?|Ты познакомился с кем-нибудь интересным на приёме?|Did you meet|Have you met|Вопрос предполагает завершившийся приём, конкретный эпизод.|Present Perfect возможен, если приём ещё идёт, а здесь подразумевается, что он закончился.
`)]},
 {title:'Заполнить пропуски подходящей формой',items:gapRows(`
2a|I’m sorry about not coming last week. I [have;had;Last week задаёт прошедший период.] a cold and so I [stay;stayed;Человек остался дома тогда же.] at home.|Извини, что не пришёл на прошлой неделе. Я простудился и остался дома.
2b|Wait a minute! I [have;have;Have an idea сообщает, что сейчас есть идея.] an idea. Let’s go and see Roger. We last [see;saw;A long time ago обозначает завершённую встречу.] him a long time ago.|Минутку! У меня есть идея. Пойдём навестим Роджера. Мы давно его не видели.
2c|It’s nice to be back here in London. This is the second time I [come;have come;This is the second time связывает два приезда с настоящим.] here.|Приятно вернуться в Лондон. Я приезжаю сюда во второй раз.
2d|I’m phoning about your bicycle for sale, which I [see;saw~have seen;Saw подходит для чтения объявления в прошлом, have seen подаёт его как причину текущего звонка.] in the local paper. [you sell;Have you sold;Важен результат на текущий момент.] it? Or is it still available?|Звоню по поводу велосипеда, объявление о продаже которого я увидел в местной газете. Вы его уже продали? Или он ещё продаётся?
2e|This place is in a terrible mess! What on earth [you do;have you been doing~have you done;Continuous спрашивает о процессе, Simple акцентирует результат.]?|Тут ужасный беспорядок! Что ты тут делал?
2f|And now for an item of local news. Hampshire police [find;have found;Результат сообщается как новость.] the dangerous snake which [go;went~had gone;Earlier in the week указывает, когда змея пропала. Past Perfect дополнительно показывает, что это произошло до находки.] missing earlier in the week.|А теперь местные новости. Полиция Хэмпшира нашла опасную змею, пропавшую в начале недели.
2g|This tooth [kill;has been killing;Lately и продолжающаяся боль указывают на процесс до настоящего.] me lately! So I [make;have made~made;Запись уже есть: у действия есть результат сейчас. Past Simple также возможен, если сообщается сам факт записи.] an appointment with the dentist for next Tuesday.|В последнее время этот зуб ужасно болит! Поэтому я записался к стоматологу на следующий вторник.
2h|I can’t give you the report I [promise;promised;Обещание было дано в прошлом.] for today because I [not finish;have not finished;Отчёт до сих пор не готов.] it.|Я не могу отдать обещанный на сегодня отчёт, потому что ещё его не закончил.
`)},
 {title:'Выбрать выражение времени',items:choices('perfect',`
3a
3b|It’s ages ___ I last went to a football match.|Прошла целая вечность с тех пор, как я был на футболе.|since|ago|Since вводит точку отсчёта, здесь это придаточное предложение.|Ago обозначает, сколько времени назад случилось событие, и не вводит такое придаточное.
3c
3d|What have you been doing ___?|Чем ты сегодня занимался?|today|yesterday|Today может включать текущий момент, что подходит для Present Perfect Continuous.|Yesterday — завершённый день, обычно нужен Past Simple или Past Continuous.
3e|Have you eaten Italian food ___?|Ты раньше ел итальянскую еду?|before|already|Before естественно для общего вопроса об опыте.|Already подразумевало бы, что собеседник уже поел итальянскую еду раньше ожидаемого или в рамках конкретного плана.
3f|I’ve been living here ___ the end of last year.|Я живу здесь с конца прошлого года.|since|in|Since обозначает начало периода, продолжающегося до сих пор.|In относило бы действие к завершённому периоду.
3g|Actually I had dinner with Sue ___.|Вообще-то я ужинал со Сью вчера вечером.|last night|lately|Last night — конкретный завершённый период, подходящий Past Simple.|Lately обычно описывает недавний период до текущего момента, а не конкретный ужин.
3h|I’ve been trying to get in touch with David ___.|Я уже целую вечность пытаюсь связаться с Дэвидом.|for ages|for the last time|For ages обозначает длительность попыток.|For the last time означает «в последний раз» и не обозначает их длительность.
3i|Terry hasn’t been to Edinburgh ___ we went there together.|Терри не был в Эдинбурге с тех пор, как мы ездили туда вместе.|since|when|Since обозначает начало периода, когда Терри больше там не бывал.|When обозначает момент, а здесь нужен промежуток от прошлого до настоящего.
3j|I can’t remember ___ I’ve had this watch.|Не помню, сколько времени у меня эти часы.|how long|when|How long спрашивает о длительности состояния.|When спрашивало бы о конкретном моменте приобретения.
`)},
 {title:'Present Perfect или Present Perfect Continuous',items:[
 ...gapRows(`
4a|Someone [eat;has eaten;Все пирожные съедены. All the cakes подчёркивает результат.] all the cakes. I’ll have to buy some more.|Кто-то съел все пирожные. Придётся купить ещё.
4b|What [you buy;have you bought;Вопрос о том, какой подарок уже куплен.] your sister for her birthday?|Что ты купил сестре на день рождения?
4c|My throat is really sore. I [sing;have been singing;Длительность пения и его последствие сейчас.] all evening.|У меня сильно болит горло. Я пел весь вечер.
4d|Brenda [learn;has been learning;Изучение языка продолжается, оценивается сам процесс.] Russian, but she finds it difficult.|Бренда учит русский, но он даётся ей трудно.
`),
 ...choices('perfect').filter(item=>item.reference==='4e').map(item=>({...item,options:undefined,gaps:[{cue:'you invite',answers:['have you invited'],explanation:item.options.find(option=>option[3])[2]}],prompt:item.prompt.replace('___','[you invite]')})),
 ...gapRows(`
4f|Those two cats [sit;have been sitting;Продолжающийся процесс с for the last hour.] on that branch for the last hour.|Эти две кошки уже час сидят на той ветке.
4g|It [rain;has been raining;Дождь продолжался весь день и всё ещё идёт.] all day! Why can’t it stop?|Весь день идёт дождь! Почему он никак не прекратится?
4h|Diana [wear;has worn;Twelve different dresses — уже достигнутое количество.] twelve different dresses in the past week!|За последнюю неделю Диана надела двенадцать разных платьев!
4i|I [do;have done;Everything и вопрос о следующих шагах указывают на завершение.] everything you asked. What should I do now?|Я сделал всё, о чём ты просил. Что мне теперь делать?
4j|Graham and Pauline [try;have been trying;Длительный поиск всё ещё не дал результата.] to find a house for ages, but they can’t find one they can afford.|Грэм и Полин давно ищут дом, но не могут найти вариант по карману.
`)]},
 {title:'Новость о находке нефти',passage:true,items:gapRows(`
5.1–2|It was announced in London this morning that the British Oil Corporation [discover;has discovered~discovered;Present Perfect подчёркивает актуальность новости. Past Simple возможен, если находку подают как событие.] oil under the sea near the Welsh coast. The company, which [drill;has been drilling;Since 2001 указывает на процесс от прошлого до текущего момента.] for oil in the area since 2001,|Сегодня утром в Лондоне сообщили, что British Oil Corporation обнаружила нефть под морским дном у берегов Уэльса. Компания ведёт там бурение с 2001 года.
5.3–6|[find;found;Last month — завершённый период.] small amounts of oil near Swansea last month, and since then [discover;has discovered;Since then охватывает период до настоящего.] larger amounts under the seabed nearby. Last year the government [lend;lent;Last year указывает на завершённый период.] over $50,000,000 to BOC, and [give;gave;Разрешение было выдано тогда же.] permission for the company to build an oil refinery and other facilities in South Wales.|В прошлом месяце компания нашла немного нефти возле Суонси, а с тех пор обнаружила более крупные запасы под морским дном неподалёку. В прошлом году правительство одолжило BOC больше 50 миллионов долларов и разрешило построить нефтеперерабатывающий завод и другие объекты в Южном Уэльсе.
5.7–8|The reaction of local people to today’s news [be;has been;So far охватывает время до сих пор.] mixed so far. Local MPs [already welcome;have already welcomed;Already подчёркивает реакцию, полученную к настоящему моменту.] the news, pointing out that the oil industry will bring badly needed jobs to the area. But local residents are worried about the danger of pollution.|Пока реакция местных жителей неоднозначна. Местные депутаты уже приветствовали новость, отметив, что нефтяная промышленность создаст необходимые рабочие места. Но жители обеспокоены риском загрязнения.
5.9–12|“Nobody [ask;has asked;Yet охватывает время до настоящего.] us yet what we want”, said Ann Griffiths, leader of the Keep Out The Oil Campaign. “Look what [happen;happened;Речь о завершённых событиях 1960-х.] when they [find;found;In the 1960s указывает на конкретное прошлое.] oil in Scotland in the 1960s. The oil companies [get;got;Последствие относится к тому же периоду.] rich, not the local people.|«Нас ещё никто не спросил, чего мы хотим», — сказала Энн Гриффитс, лидер кампании против добычи нефти. «Посмотрите, что случилось, когда в 1960-х в Шотландии нашли нефть. Разбогатели нефтяные компании, а не местные жители.
5.13–15|BOC [not tell;has not told;Правду не сообщили до настоящего момента.] us the truth about what this is going to mean for our people”. A BOC spokesman later [refuse;refused;Later обозначает последующее событие рассказа.] to comment. Meanwhile local campaigners [ask;have asked~asked;Present Perfect передаёт актуальный результат обращения. Past Simple возможен при сообщении о завершённом обращении.] the government to hold an inquiry.|BOC не сказала нам правду о том, что это будет значить для наших людей». Представитель BOC позже отказался от комментариев. Тем временем местные активисты попросили правительство провести расследование.
`)},
],
future: [
 {title:'Выбрать форму будущего времени',items:choices('future',`
1a|Why ___ a new mountain bike?|Зачем ты собираешься купить новый горный велосипед?|are you going to buy|will you buy|Вопрос об обдуманном намерении, поэтому естественно going to.|Will you buy здесь звучит менее естественно для вопроса о причине уже принятого решения.
1b
1c
1d
1e
1f
1g|Can you call me at 7.00, because ___ tomorrow.|Можешь позвонить мне в семь? Я завтра уезжаю.|I’m leaving|I’ll leave|Речь о запланированном отъезде, поэтому подходит Present Continuous.|Will здесь скорее передаёт прогноз или решение в момент речи.
1h
`)},
 {title:'Подобрать форму по контексту',items:gapRows(`
2a|I can’t see you on Thursday afternoon. I [visit;am visiting~will be visiting~am going to visit;Present Continuous описывает договорённость, Future Continuous — занятость в этот момент, going to — намеченный визит.] our Birmingham branch.|Не могу встретиться в четверг днём: буду в нашем бирмингемском филиале.
2b|George [not be;will not be~is not going to be;Сообщают, что Джорджа не будет до определённого часа.] back until six. Can I take a message?|Джордж не вернётся до шести. Ему что-нибудь передать?
2c|What [you buy;are you going to buy~will you buy;Going to спрашивает о намерении, will — о будущем решении.] with the money you won in the lottery?|Что ты купишь на деньги, выигранные в лотерею?
2d|I don’t think you [have;will have~are going to have;После I don’t think естественно will для прогноза, going to тоже возможен.] any problems at the airport.|Думаю, у тебя не будет проблем в аэропорту.
2e|[you take;Are you taking~Are you going to take~Will you be taking~Will you take;Это может быть вопрос о договорённости, намерении или о планах на будущее.] your dog with you to Scotland?|Ты возьмёшь собаку с собой в Шотландию?
2f|All the hotels are full. Where [we spend;are we going to spend~will we spend~shall we spend;Вопрос о плане ночлега или поиске решения.] the night?|Все отели заполнены. Где мы переночуем?
2g|You’d better not come in July. My mother [stay;will be staying~is staying~is going to stay;Future Continuous передаёт ситуацию в июле, Present Continuous — договорённость, going to — план.] with me then.|Лучше не приезжай в июле. В это время у меня будет гостить мама.
2h|What time [your plane leave;does your plane leave~is your plane leaving~will your plane leave;Present Simple естественен для расписания. Другие формы возможны при вопросе о договорённости или прогнозируемом времени вылета.]?|Во сколько вылетает твой самолёт?
`)},
 {title:'Придаточные времени о будущем',items:gapRows(`
3a|When I [see;see;В придаточном после when используется настоящее.] you tomorrow, I [tell;will tell;В главной части will выражает будущее действие.] you my news.|Когда я увижу тебя завтра, расскажу новости.
3b|As soon as we [get;get~have got;В придаточном используется настоящее. Perfect подчёркивает завершение прибытия.] there, we [phone;will phone;Главная часть сообщает будущее действие.] for a taxi.|Как только доберёмся туда, вызовем такси.
3c|I [go;will go~am going;Will сообщает план, Present Continuous может передавать договорённость.] to the library before I [do;do;В придаточном после before используется настоящее.] the shopping.|Я схожу в библиотеку, прежде чем пойти за покупками.
3d|We [wait;will wait;Будущее в главной части.] here until the rain [stop;stops~has stopped;После until используется настоящая форма. Perfect подчёркивает, что дождь закончится.].|Мы подождём здесь, пока дождь не прекратится.
3e|I [get;will get;Главная часть сообщает будущее действие.] $50 from the bank when it [open;opens;В придаточном после when используется Present Simple.].|Я сниму 50 долларов в банке, когда он откроется.
3f|After you [take;take~have taken;В придаточном настоящее. Present Perfect подчёркивает завершение приёма лекарства.] the medicine, you [feel;will feel;Will вводит прогноз.] better.|После того как примешь лекарство, тебе станет лучше.
3g|You have to stay until you [finish;finish~have finished;В придаточном после until подойдут Present Simple и Present Perfect с акцентом на завершение.] your work.|Тебе нужно остаться, пока не закончишь работу.
3h|I [let;will let;Сообщение о намерении в главной части.] you know the minute I [hear;hear;The minute означает «как только» и вводит придаточное времени.] the results.|Дам тебе знать, как только узнаю результаты.
3i|Before we [paint;paint;В придаточном после before используется настоящее.] the wall, we [have;will have;В главной части will сообщает о будущем действии.] a cup of tea.|Прежде чем красить стену, мы выпьем чаю.
3j|We [climb;will climb;В главной части will сообщает о будущем действии.] over the wall as soon as it [get;gets~has got;После as soon as используется настоящая форма, даже при будущем значении.] dark.|Мы перелезем через стену, как только стемнеет.
`)},
 {title:'Будущий процесс или завершение к сроку',items:gapRows(`
4a|By the time we reach home, the rain [stop;will have stopped;Дождь закончится к моменту возвращения.].|К тому времени, как мы доберёмся домой, дождь уже закончится.
4b|This time next week I [lie;will be lying;В конкретный момент следующей недели действие будет в процессе.] on the beach in Spain.|В это время на следующей неделе я буду лежать на пляже в Испании.
4c|In ten years’ time I [work;will be working~will work;Continuous рисует ситуацию в тот момент, will work может передать прогноз.] for a different company.|Через десять лет я буду работать в другой компании.
4d|If we don’t get there by 6.00, Jack [leave;will have left~will leave;С Future Perfect Джек уже уйдёт к шести, с will leave его уход — последствие опоздания.].|Если мы не доберёмся туда к шести, Джек уйдёт или уже будет ушедшим к нашему приходу.
4e|In July they [be married;will have been married;К указанному будущему моменту пройдёт двадцать лет брака.] for twenty years.|В июле исполнится двадцать лет, как они женаты.
4f|In the year 2500 a lot of people [live;will live~will be living~are going to live;Will даёт прогноз, Future Continuous описывает жизнь в тот период, going to тоже может выражать прогноз.] on the Moon.|В 2500 году многие будут жить на Луне.
4g|When you get to the station, I [wait;will be waiting~will wait;Future Continuous означает, что к моменту прибытия я буду ждать. Will wait может выражать обещание ожидать.] for you outside.|Когда ты доберёшься до вокзала, я буду ждать тебя снаружи.
4h|Don’t worry! The plane [land;will land~is going to land~will be landing~is landing;In a moment указывает на скорую посадку. Можно сообщить прогноз, признаки или запланированное действие.] in a moment.|Не волнуйся! Самолёт сейчас приземлится.
4i|By the time you come home, I [finish;will have finished;Работы завершатся к моменту возвращения.] the decorating.|К тому времени как ты вернёшься домой, я уже закончу отделку.
4j|Come round between eight and nine. We [watch;will be watching~are watching~are going to watch;Future Continuous описывает занятие в этот промежуток. Другие формы передают договорённость или план.] the match on television then.|Заходи между восемью и девятью. В это время мы будем смотреть матч по телевизору.
`)},
 {title:'Текст о компьютере Computafuture',passage:true,items:gapRows(`
5.1–3|Have you ever wondered what exactly [you do;you will be doing~you will do;Continuous описывает, чем человек будет занят через десять лет. В косвенном вопросе прямой порядок слов.] in ten years’ time? Well, according to computer expert Tom Vincent, computers [soon be able;will soon be able~will be able soon;Will выражает прогноз о способности компьютеров.] to make accurate predictions about the future. Professor Vincent, from Cambridge, [hold;is holding~is going to hold~will hold~will be holding;Конференция запланирована, поэтому естественна форма договорённости. Will тоже может сообщать о предстоящем событии.] a press conference next week to describe the computer which he calls “Computafuture”.|Ты когда-нибудь задумывался, чем будешь заниматься через десять лет? По словам специалиста Тома Винсента, компьютеры скоро смогут точно предсказывать будущее. На следующей неделе профессор Винсент из Кембриджа проведёт пресс-конференцию о компьютере Computafuture.
5.4–6|“This computer can tell us what life [be;will be~is going to be;Это прогноз о будущей жизни.] like, based on data describing past events”, explains Professor Vincent. For example, Computafuture can predict how many people [live;will live~will be living;Will сообщает прогноз, Future Continuous описывает жизнь в конкретный период.] in a particular area, or whether there [be;will be~is going to be;Прогноз о количестве дождей.] a lot of rain during a particular period.|«Компьютер может рассказать, какой будет жизнь, опираясь на данные о прошлом», — объясняет профессор. Например, он предсказывает, сколько людей будет жить в определённой местности и будет ли много дождей за определённый период.
5.7–8|Professor Vincent also believes that by the year 2050, computers [replace;will have replaced;By the year 2050 задаёт срок, к которому замена завершится.] teachers, and [also do;will also be doing~will also do~will have also done~will also have done~have also done;Continuous подчёркивает будущую деятельность, а Future Perfect — выполненную к сроку работу.] most of the jobs now being done by the police.|Профессор Винсент также считает, что к 2050 году компьютеры заменят учителей и будут выполнять большую часть работы полиции.
5.9–10|“Computers are becoming more intelligent all the time”, says Professor Vincent. “Soon they [direct;will be directing~will direct;Future Continuous описывает регулярную деятельность в будущем, will даёт прогноз.] traffic and [teach;will be teaching~will teach~teaching~teach;Teaching может делить will be с directing. Teach может делить will с direct.] our children. And telling us about the future”.|«Компьютеры становятся всё умнее, — говорит профессор. — Скоро они будут регулировать движение, обучать наших детей и рассказывать нам о будущем».
`)},
],
};
