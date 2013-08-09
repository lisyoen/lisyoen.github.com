// MUD helper
// for http://mud.waitfor.net
/*
Release note
2013-08-08
  0.1.1 
		로딩 구조 
	0.1.2
		동서남북 초성이동
	0.1.3
		화살표 위/아래 키로 최근 명령 부르기
		reload/unload 구조
		prefix 기능 추가 (홀따옴표로 시작하면 외치기)
	0.1.4
		postfix 기능 추가 (느낌표로 마치면 외치기)
2013-08-09
	0.1.5
		다시하기 명령(ㄱ) 추가
	0.1.6
		폰트 명령 추가
	0.1.7
		모바일 모드 추가
*/

function helper() {

	var loaded = true;

	var scriptUrl = 'http://lisyoen.cafe24.com/lisyoen/mud.js';
	
	var that = this;
	var panAlias;
	var panCmd;
	
	this.setPanAlias = function(param) {
		panAlias.empty();
		panAlias.append(
			$('<button>', {'class': 'btn btn-inverse', style: 'color:#999', 'data-alias': '봐'})
				.text('봐')
				.on('click', function() {
					that.cmd('봐');
				})
		);
	
		for (var p in param) {
			var cmd = param[p];
			(function(cmd2){
				panAlias.append(
					$('<button>', {'class': 'btn btn-inverse', style: 'color:#999', 'data-alias': cmd})
						.text(cmd)
						.on('click', function() {
							that.cmd(cmd2);
						})
				);
			})(cmd);
		}
	}
	
	this.echoDataPre = function(data) {
		//console.log('echo:' + data);
		if (data.slice(0, 4) === '출구 :') {
			var param1 = data.slice(5, data.length).split(' ');
			var param2 = [];
			for (var p in param1) {
				if (param1[p] !== '') {
					param2.push(param1[p]);
				}
			}
			
			this.setPanAlias(param2);
		}
	};
	
	var originalEchoData;
	this.hookEchoData = function() {
		var originalEchoData = echoData;
		echoData = function(data) {
			that.echoDataPre(data);
			originalEchoData(data);
		};
	}
	
	this.unhookEchoData = function() {
		echoData = originalEchoData;
	};
	
	this.load = function() {
		that.logo();

		if ($('#btnPCMobile').length > 0) {
			$('#btnPCMobile').remove();
		}
		if ($('#panAlias').length > 0) {
			$('#panAlias').remove();
		}
		panCmd = $('#altc div').attr({id: 'panCmd'});
		$('#altc').prepend($('<div>', {id: 'panAlias', style: 'border-width:1px'}));
		panAlias = $('#panAlias');

		panCmd.append($('<button>', {'class': 'btn btn-inverse', id: 'btnPCMobile', style: 'color:#999'}).text('Mobile'));
		$('#btnPCMobile').on('click', function() {
			that.setMobile();
		});

		this.hookKeydown();
		this.hookEchoData();
		
		cmdobj.focus();
		
		var script = $('script');
		script.each(function(a, b) {
			var attr = b.attributes['src'];
			if (attr && attr.value === scriptUrl) {
				b.remove();
			}
		});
	};
	
	this.unload = function(url) {
		this.unhookKeydown();
		this.unhookEchoData();
		
		loaded = false;
	};
	
	this.reload = function(url) {
		if (loaded) {
			this.unload();
		}
		
		$('head').append($('<script>', {src: scriptUrl}));
	};

	this.title = 'MUD helper v0.1.6 (2013-08-09)';
	
	this.logo = function() {
		that.echo('<h3>' + this.title + '</h3>', 'white');
		that.echo('<div style="border-style:solid; border-width:1px; background-color:#202020; padding: 10px">'
			+ '동서남북을 초성으로 입력할 수 있습니다.<br/>'
			+ ' 예> ㄷ => 동<br/>'
			+ '화살표 위/아래 키로 최근 명령을 불러올 수 있습니다.<br/>'
			+ "첫 글자로 명령을 대신할 수 있습니다.<br/>"
			+ " 예> !쉽게 외치기<br/>"
			+ "마지막 글자로 명령을 대신할 수 있습니다.<br/>"
			+ ' 예> 쉽게 외치기 외<br/>'
			+ '"ㄱ"를 입력하면 마지막 명령을 반복할 수 있습니다.<br/>'
			+ "폰트를 변경할 수 있습니다.<br/>"
			+ " 예> 14px/20px 굴림 폰트<br/>"
			+ '<br/>다음 버전 예고<br/>'
			+ '+ 모바일 모드<br/>'
			+ '+ 명령어 반복<br/>'
			+ '+ 연속 명령어<br/>'
			+ '</div>');
	};
	
	this.about = function() {
		that.echo('<h4>' + this.title + ' 정보<h4>', 'white');
		that.echo('<div style="border-style:solid; border-width:1px; background-color:#202020; padding: 10px">'
			+ '제작: 이창연(lisyoen)<br/>'
			+ '</div>');
	};
	
	var cmdobj = $('#cmd');
	
	var keyHistory = [];
	//var keyFirst = 0;
	var keyLast = 0;
	var keyCurrent = keyLast;
	keyHistory[keyCurrent] = '';
	
	var lastCommand = '';

	this.keydownpre = function(e) {
		//console.log('keydownpre: ' + e.keyCode + ', ' + e.ctrlKey);
		var ctrl = e.ctrlKey;
		var key = e.keyCode;
		window.e = e;
		var cmd = cmdobj.val();
		
		switch (key) {
			case 13: {	// enter
				var data = $.trim(cmd);
				var param = '';
				if (data.lastIndexOf(' ') > -1) {
					param = data.substring(0, data.lastIndexOf(' '));
					cmd = data.substring(data.lastIndexOf(' ')+1).toLowerCase();
				}
			
				switch (cmd) {
					case 'ㄷ':
						cmdobj.val('동');
						break;
					case 'ㅅ':
						cmdobj.val('서');
						break;
					case 'ㄴ':
						cmdobj.val('남');
						break;
					case 'ㅂ':
						cmdobj.val('북');
						break;
					case '!':
					case 'ㄱ':
						that.cmd(lastCommand);
						cmdobj.val('');
						return true;
					case '폰트':
					case 'font':
					case '글꼴':
						$('#screenContents').css({font: param});
						cmdobj.css({font: param});
						that.echo('글꼴이 ' + param + ' 으로 변경되었습니다.', 'white');
						cmdobj.val('');
						break;
					default:
						break;
				}
				
				keyHistory[keyCurrent] = data;
				keyCurrent++;
				
				var prefix = data.slice(0, 1);
				var contents = data.slice(1);
				switch (prefix) {
					case "!":
						data = contents + ' 외쳐';
						cmdobj.val(data);
						break;
					default:
						break;
				}
				var postfix = data.slice(data.length-1, data.length);
				contents = data.slice(0, data.length-1);
				switch (postfix) {
					case '외':
						if (contents.length === 0) break;
						data = contents + ' 외쳐';
						cmdobj.val(data);
						break;
					default:
						break;
				}
				
				lastCommand = cmdobj.val();
			} break;
			case 38: {	// up arrow
			} break;
			case 40: {	// down arrow
			} break;
		}
		
	};

	this.keydownpost = function(e) {
		//console.log('keydownpost: ' + e.keyCode);
		var ctrl = e.ctrlKey;
		var key = e.keyCode;
		var cmd = cmdobj.val();
		
		switch (key) {
			case 13: {	// enter
				switch (cmd) {
					default:
						break;
				}
				
				if (ctrl) {
					cmdobj.val(keyHistory[keyCurrent]);
				} else {
					keyHistory[keyCurrent] = '';
				}
			} break;
			case 38: {	// up arrow
				keyCurrent--;
				if (keyCurrent < 0) {
					keyCurrent = 0;
				}
				cmdobj.val(keyHistory[keyCurrent]);
			} break;
			case 40: {	// down arrow
				keyCurrent++;
				if (keyCurrent < 0) {
					keyCurrent = 0;
				}
				cmdobj.val(keyHistory[keyCurrent]);
			} break;
		}
		
	};
	
	var originalKeydownHandler;
	this.hookKeydown = function() {
		var preHandler = this.keydownpre;
		var postHandler = this.keydownpost;
		originalKeydownHandler = $._data($('#cmd')[0], "events").keydown[0].handler;
		$._data($('#cmd')[0], "events").keydown[0].handler = function(e) {if (!preHandler(e)) {originalKeydownHandler(e); postHandler(e);}}
	};
	
	this.unhookKeydown = function() {
		$._data($('#cmd')[0], "events").keydown[0].handler = originalKeydownHandler;
	}
	
	this.echo = function(msg, color) {
		if (color) {
			echoData('<span style="color:' + color + '">' + msg + '</span>');
		} else {
			echoData(msg);
		}
	};
	
	this.cmd = function(msg) {
		var cmd = msg;
        var data = $.trim(cmd);
        var param = '';
		if (data.lastIndexOf(' ') > -1) {
			param = data.substring(0, data.lastIndexOf(' '));
			cmd = data.substring(data.lastIndexOf(' ')+1);
		}
		if ($.trim(cmd).length > 0) {
			socket.emit('cmd', {'data': data, 'cmd': cmd, 'param':param});
        }
	};
	
	this.setMobile = function() {
		if ($('#btnPCMobile').length > 0) {
			$('#btnPCMobile').remove();
		}
		
		this.setPanAlias();

		$('#btnLoadHelper').text('H');
		$('#btnGotoCommunity').remove();
		$('#panCmd a').remove();
		$('body').css({padding: '0px'});

		that.echo('Mobile 모드로 동작합니다.', 'white');
	};
}

(function() {
	window.h = new helper();
	h.load();
})();
