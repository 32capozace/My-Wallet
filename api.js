function Transaction () { }
function Block () { }

function BlockFromJSON(json) {
	var block = new Block();

	block.hash = json.hash;
	block.time = json.time;
	block.nTx = json.n_tx;
	block.blockIndex = json.block_index;
	block.height = json.height;
	block.txIndex = json.txIndexes;
	
	return block;
}


function AlreadyHaveTransaction(txIndex) {
    return ($('#tx-'+txIndex).length > 0);
}

function TransactionFromJSON(json) {
	
	var tx = new Transaction();
	
	tx.hash = json.hash;
	tx.size = json.size;
	tx.txIndex = json.tx_index;
	tx.time = json.time;
	tx.in = json.in;
	tx.out = json.out;
	tx.blockIndex = json.block_index;

	try {
		for (var i = 0; i < tx.in.length; i++) {		
			tx.in[i].prev_out.addr = new Bitcoin.Address(Crypto.util.hexToBytes(tx.in[i].prev_out.hash));
		}
		
		for (var i = 0; i < tx.out.length; i++) {		
			tx.out[i].addr = new Bitcoin.Address(Crypto.util.hexToBytes(tx.out[i].hash));
		}
	} catch(e) {
		
	}
	
	return tx;
}

Array.prototype.hasObject = (
  !Array.indexOf ? function (o)
  {
    var l = this.length + 1;
    while (l -= 1)
    {
        if (this[l - 1] === o)
        {
            return true;
        }
    }
    return false;
  } : function (o)
  {
    return (this.indexOf(o) !== -1);
  }
);

Transaction.prototype.getResult = function() {    
		
	var total_output = 0;
	
	for (var i = 0; i < this.out.length; i++) {
		output = this.out[i];
		
		var value = parseInt(output.value) / 100000000;
		
		if (this.myHashes160 == null) 
			total_output += value;
		else if (this.myHashes160.hasObject(output.hash)) {
			total_output += value;
		}
	}
	
	if (this.myHashes160 == null) 
		return total_output;
		
	for (var i = 0; i < this.in.length; i++) {
		input = this.in[i];
		 
		var value = parseInt(input.prev_out.value) / 100000000;

		if (this.myHashes160.hasObject(input.prev_out.hash)) {
			total_output -= value; //Should be minus but the number will be negative
		}
	}

	
	return total_output;
}

Transaction.prototype.setMyHashes = function(myHashes160) {    
	this.myHashes160 = myHashes160;
};

Transaction.prototype.setConfirmations = function(n_confirmations) {    
	
	var confirmations_el = $('#tx-'+this.txIndex+' .confirmations');
	
	confirmations_el.hide();
			
	if (n_confirmations == 0) {
		confirmations_el.fadeIn(200);

		confirmations_el.attr('class', 'btn error');
		confirmations_el.html('Unconfirmed Transaction!');
	} else if (n_confirmations <= 100) {
		confirmations_el.fadeIn(200);

		confirmations_el.attr('class', 'btn primary');
		confirmations_el.html(n_confirmations + ' Confirmations');
	} else {
		confirmations_el.fadeOut(200);
	}
}

Transaction.prototype.getHTML = function() {    

    var total_output = this.getResult();

    
	var html = '<div id="tx-'+this.txIndex+'"><table class="zebra-striped" cellpadding="0" cellspacing="0" style="padding:0px;float:left;margin:0px;margin-top:10px;">\
	<tr><th colspan="2">';
	
	if (this.myHashes160 != null) {
		if (total_output > 0) {
			html += '<span class="label success">Payment Received</span>';
		} else if (total_output < 0) {
			html += '<span class="label important">Payment Sent</span>';
		}	else if (total_output == 0) {
			html += '<span class="label">Funds Moved</span>';
		}
	}
	
	html += ' <a style="font-size:12px;font-weight:normal" href="'+root+'tx-index/'+this.txIndex+'/'+this.hash+'">'+this.hash+'</a>';
			
	html += '</th><th>';
	
	if (this.time > 0) {
		var date = new Date(this.time * 1000);
	
		html += $.format.date(date, "yyyy-MM-dd HH:mm:ss");
	}
	
	html += '</th><th><span class="adv">' + this.size + ' (bytes)</span></th></tr><tr><td width="55%" style="vertical-align:middle;"><ul class="txul">';
   
    if (this.in.length > 0) {
		for (var i = 0; i < this.in.length; i++) {
			input = this.in[i];
			 
			//total_fees += input.prevOutputValue;
			
			if (this.myHashes160 != null && this.myHashes160.hasObject(input.prev_out.hash)) {
				html += '<li>'+input.prev_out.addr+'</li>';
			} else if (input.prev_out.hash == null || input.prev_out.hash.length == 0) {
				html += '<li><b>No Input (Newly Generated Coins)</b></li>';
			} else {
				html += '<li><a href="'+root+'address/' + input.prev_out.hash +'">'+input.prev_out.addr+'</a></li>';
			}
		}
    } else {
		html += '<li>No inputs, transaction probably sent from self.</li>';
    }


	html += '</ul></td><td style="padding:0px;width:48px;min-height:48px;vertical-align:middle;">';
	
	var button_class;
	if (total_output > 0) {
		button_class = 'btn success';
		html += '<img src="'+resource+'arrow_right_green.png" />';
	} else if (total_output < 0) {
		button_class = 'btn error';
		html += '<img src="'+resource+'arrow_right_red.png" />';
	} else  {
		button_class = 'btn';
		html += '&nbsp;';
	}
	
	html += '</td><td width="30%" style="vertical-align:middle;"><ul class="txul">';
	
	for (var i = 0; i < this.out.length; i++) {
		output = this.out[i];
						
		//total_fees -= output.value;

		if (this.myHashes160 == null || !this.myHashes160.hasObject(output.hash))
			html += '<li><a href="'+root+'address/'+output.hash+'">'+output.addr+'</a></li>';
		else 
			html += '<li>'+output.addr+'</li>';
	}
				
	html += '</ul></td><td width="15%" style="vertical-align:middle;"><ul class="txul">';
	
	for (var i = 0; i < this.out.length; i++) {
		output = this.out[i];
						
		var value = output.value / 100000000;
		
		html += '<li>' + value +' BTC</li>';
	}
	
	html += '</ul></td></tr></table><span style="float:right;padding-bottom:30px;clear:both;">';
	
	if (this.ip != null && this.ip.length > 0) {
		html += '<span class="adv"><i>Received from: <a href="'+root+'ip-address/'+this.ip+'">'+this.ip+'</a> <a href="http://www.dnsstuff.com/tools/ipall/?tool_id=67&ip='+this.ip+'" target="new">(whois)</a> - </span>';	
	}	
	
	html += '<button class="confirmations" style="display:hidden"></button> ';
		
	html += '<button class="btn info">'+  (Math.round(total_output * market_price * 100)/100).toFixed(2) + ' USD</button> <button class="'+button_class+'">'+  total_output.toFixed(4) + ' BTC</button></span></div>';
	
	return html;
};