//LilScript is a JavaScript framework writen by Dev Bash
//For writing Easy debuggable codes and for web applications
//it comes with many debugging features
//Writen on 26th April, 2021
//Writen just in 2 days
let ls;

if(document.readyState !== 'loading'){
    initLilScript();
}else{
    document.addEventListener('DOMContentLoaded', function () {
        initLilScript();
    });
}


function initLilScript(){
	ls = new lilscript();
	let scripts = document.getElementsByTagName("script");
	for(j=0;j<scripts.length;j++){
		let type = "text/lilscript";
		if(scripts[j].type.toLowerCase().trim() == type && scripts[j].innerText.trim() != ""){
			let codes = ls.run(scripts[j].innerText);
			eval(codes);
			scripts[j].innerText = codes;
		}else if(scripts[j].type.toLowerCase().trim() == type && scripts[j].src.trim() != ""){
			ls.runFromUrl(scripts[j].src);
			scripts[j].remove();
		}else{
			//Ignore
		}
	}
}

function lilscript(){
  self = this;
  this.runFromUrl = (url) => {
	var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(this.status == 200){
			let fl = this.responseText;
			eval(self.run(fl));
		}
	}
	xhr.open('GET', url, true);
    xhr.send();
  }
  this.fix = String.prototype.fix = function() {
        let fixed_str = this;
        if(this.trim().endsWith(";")){
            fixed_str = this.substring(0,this.length-1).trim();
        }
       return fixed_str;
  }
  this.replaceAll = String.prototype.replaceAll = (search,replace) => {
  	    return this;
  }
  this.clean = (code) =>{
  	let clean_code = "";
  	let uncmt_code = code.split("\n");
  	for(j=0;j<uncmt_code.length;j++){
  		if(uncmt_code[j].startsWith("#")){
  			uncmt_code[j] = "";
  		}
  		if(uncmt_code[j].trim().startsWith("//")){
  			uncmt_code[j] = "";
  		}
  		if(uncmt_code[j].trim().startsWith("#")){
  			uncmt_code[j] = "";
  		}
  		if(uncmt_code[j].trim() == "" || uncmt_code[j].trim() == "\n"){
  			//uncmt_code.splice(j,1);
  		}
  		if(uncmt_code[j].trim().includes("//")){
  			uncmt_code[j] = uncmt_code[j].replace("//","\n//");
  		}
  	}
  	clean_code = uncmt_code.join("\n");

	let searchRegExp = new RegExp(/(;)(?=(?:[^"]|"[^"]*")*$)/, 'g');
	let searchRegExp1 = new RegExp(/({)(?=(?:[^"]|"[^"]*")*$)/, 'g');
	let searchRegExp2 = new RegExp(/(    )(?=(?:[^"]|"[^"]*")*$)/, 'g');
	let searchRegExp3 = new RegExp(/(function)(?=(?:[^"]|"[^"]*")*$)/, 'g');
	let searchRegExp4 = new RegExp(/(})(?=(?:[^"]|"[^"]*")*$)/, 'g');
	//let searchRegExp2 = new RegExp(/()(?=(?:[^"]|"[^"]*")*$)/, 'g');
    clean_code = code.replace(searchRegExp, ";\n");
    clean_code = clean_code.replace(searchRegExp1, "{\n");
    clean_code = clean_code.replace(searchRegExp2, "\t");
    clean_code = clean_code.replace(searchRegExp3, "\nfunction ");
    clean_code = clean_code.replace(searchRegExp4, "\n}");
    //clean_code = clean_code.replace(searchRegExp2, "\t");
    let codes = clean_code.split("\n");
    re = /(;)(?=(?:[^"]|"[^"]*")*$)/;
    for(i=0;i<codes.length;i++){
    	if((re.exec(codes[i])) != null){
            codes[i] = codes[i].replace(searchRegExp, ";\n");
        }
    }
    return codes.join("\n");
  }
  this.run = (code) => {
	let Gotos = [];
	let run = [];
	let runStart = false;
	let css = [];
	let cssStart = false;
	let css_vars = [];
	let css_values = [];
	let jumpC = 0;
	let cssC = 0;
	let runC = 0;
	let keywords = ["(","var","run","css","stop","startTime","endTime","jump","land","boxline","logline"];
	let body = document.body;
	
	//let compiled = ls.clean(code).trim().split("\n");
    let compiled = code.trim().split("\n");
    
	//RegExp
	function matchThis(reg,str){
	    regex1 = reg;
        let str1 = str;
        let array1;
        let resultArray = []

        while ((array1 = regex1.exec(str1)) !== null) {
          const quantityFound = (Object.keys(array1).length - 3); // 3 default keys
          for (var o = 1; o<quantityFound; o++) { // start in 1 to avoid the complete found result 'hello:123'
            const found = array1[o];
            arraySingleResult = [found, str1.indexOf(found)];
            resultArray.push(arraySingleResult);
          }
        }
        return JSON.stringify(resultArray);
	}
    
    
    
	for(i=0;i<compiled.length;i++){
		if(compiled[i].trim().startsWith("@run")){
			if(!runStart){
				compiled[i] = "";
				runStart = true;
				runC++;
			}else{
				compiled[i] = "";
				runStart = false;
				runC--;
				let run_code = run.join("\n");
				try{
                    eval(ls.run(run_code));
				}catch(e){
					run_code = "";
					let err = e.toString();
					compiled[i] = "throw('@run: " + err + "')";
					//console.log(typeof e.toString());
				}
			}
		}
		if(runStart){
			run.push(compiled[i]);
			compiled[i] = "";
		}
		if(compiled[i].trim().startsWith("@css")){
			if(!cssStart){
				compiled[i] = "";
				cssStart = true;
				cssC++;
			}else{
				compiled[i] = "";
				cssStart = false;
				cssC--;
				let css_code = css.join("\n");
				try{
                    let style = document.createElement("style");
                    style.innerText = css_code;
                    body.appendChild(style);
                    css_code = ""
				}catch(e){
					css_code = "";
					compiled[i] = "throw('@css Inject Error')";
					//console.log(e);
				}
			}
		}
		if(cssStart){
			for(k=0;k<css_vars.length;k++){
				if(compiled[i].includes(css_vars[k])){
					compiled[i] = compiled[i].replace(css_vars[k],css_values[k]);
				}
			}
			css.push(compiled[i])
			compiled[i] = "";
		}
		if(compiled[i].trim().startsWith("#")){
			let comp = compiled[i].trim().substring(1,compiled[i].trim().length);
			compiled[i] = "//" + comp;
		}
		if(compiled[i].trim().startsWith("@")){
			let key = compiled[i].trim().split(" ")[0].trim().replace("@","");
			if(keywords.indexOf(key) == -1 && !key.startsWith("(")){
				compiled[i] = "throw('Invalid Keyword: "+key+"')";
			}
			
		}
		if(compiled[i].trim().startsWith("@var")){
            if(!compiled[i].trim().includes("=")){
            	compiled[i] = "throw('@var assignment error')";
            }else{
            	let line = compiled[i].trim();
            	let attr = line.substring(4,line.indexOf(" ",5)).trim();
            	let val = line.substring(line.indexOf("= ")+2,line.length).fix();
            	try{
            		css_vars.push("@"+attr);
                    css_values.push(eval(val));
                    compiled[i] = "";
            	}catch(e){
            		console.log(e);
                    compiled[i] = "throw('@var parse error')";
            	}
            }
		}
	    if(compiled[i].trim().startsWith("import ")){
			if(compiled[i].trim().includes("from")){
				let func = compiled[i].trim().substring(7,compiled[i].trim().indexOf("from")-1);
				let dir = compiled[i].trim().substring(compiled[i].trim().indexOf("from")+5,compiled[i].trim().length).fix();
				compiled.splice(i,1);
				let imp = eval("importFunction('"+func+"').fromModule('"+dir+"');").trim().split("\n");
				for(p=0;p<imp.length;p++){
				    compiled.splice(i+p,0,imp[p]);
				}
				i = (i-2);
				if(i < 0){
					i = 0;
				}
			}else{
				compiled[i] = "throw('Specify directory to import from')";
			}
		}
		if(compiled[i].trim().includes("func ") && compiled[i].trim().endsWith("{")){
			compiled[i] = compiled[i].trim().replace("func","function");
		}
		if(compiled[i].trim().includes(" element(")){
			let line = compiled[i].trim();
			let query = line.substring(line.indexOf(" element(")+10,line.indexOf(")",line.indexOf(" element("+10))-1);
			if(!query.startsWith(".") && !query.startsWith("#")){
				if(document.querySelector(query) != null){
					compiled[i] = compiled[i].trim().replace("element(","document.querySelector(");
				}else{
					compiled[i] = compiled[i].trim().replace("element(","document.createElement(");
				}
			}
		}
		if(compiled[i].trim().includes(" elements(")){
			compiled[i] = compiled[i].trim().replace("elements(","document.querySelectorAll(");
		}
		if(compiled[i].trim().startsWith("box")){
			if(compiled[i].trim().split(" ").length >= 2){
				let input = compiled[i].trim().substring(4,compiled[i].trim().length);
				if(input.endsWith(";")){
				compiled[i] = "alert(" + input.substring(0,input.length-1) + ");";
				}else{
				compiled[i] = "alert(" + input + ");";
				}
			}else{
				compiled[i] = "alert('[Box arg]')";
			}
		}
		if(compiled[i].trim().startsWith("log")){
			if(compiled[i].trim().split(" ").length >= 2){
				let input = compiled[i].trim().substring(4,compiled[i].trim().length);
				//alert(input);
				if(input.endsWith(";")){
					compiled[i] = "console.log(" + input.substring(0,input.length-1) + ");";
				}else{
					compiled[i] = "console.log(" + input + ");";
				}
			}else{
				compiled[i] = "console.log('[log arg]')";
			}
		}
		if(compiled[i].trim().includes(".add(")){
			compiled[i] = compiled[i].trim().replace(".add(",".append(");
		}
		if(compiled[i].trim().startsWith("@jump")){
			jumpC++;
			compiled[i] = compiled[i].trim().replace("@jump","/*");
		}
		if(compiled[i].trim().startsWith("@land")){
			jumpC--;
			compiled[i] = (compiled[i].trim().replace("@land","") + " */").trim();
		}
		
		if(compiled[i].trim().startsWith("{\"")){
			compiled[i] = compiled[i].trim().replace("{\"","/*");
		}
		if(compiled[i].trim().endsWith("\"}")){
			compiled[i] = compiled[i].trim().replace("\"}","*/");
		}

		if(compiled[i].trim().includes("@boxline")){
			compiled[i] = compiled[i].trim().replace("@boxline","alert("+(i+1)+");");
		}
		if(compiled[i].trim().includes("@logline")){
			compiled[i] = compiled[i].trim().replace("@logline","console.log("+(i+1)+");");
		}
		if(compiled[i].trim().startsWith("@startTime")){
			compiled[i] = "console.time('time')";
		}
		if(compiled[i].trim().startsWith("@endTime")){
			compiled[i] = "console.timeEnd('time')";
		}
		if(compiled[i].trim().startsWith("@goto")){
			let ln = Number(compiled[i].trim().substring(6,compiled[i].trim().length).fix().trim());
			let mln = (ln-2);
			if(Gotos.indexOf(ln) == -1){
				if(!isNaN(ln)){
					Gotos.push(ln);
					i = mln;
					compiled[i] = "";
				}else{
					compiled[i] = "throw('Goto error: Interger Expected')";
				}
			}
		}
		if(compiled[i].trim().includes("[] =")){
			let arrName = compiled[i].trim().substring(0,compiled[i].trim().indexOf("[] ="));
			let arrValue = compiled[i].trim().substring(compiled[i].trim().indexOf("[] =")+4,compiled[i].trim().length).fix();
			compiled[i] = arrName+".push("+arrValue+");";
		}
		if(compiled[i].trim().includes("elif") && compiled[i].trim().endsWith("{")){
			compiled[i] = compiled[i].trim().replace("elif","else if");
		}

        //reg rule
        retext = /(c)(?=(?:[^"|']|"[^"|']*")*$)/;

		if(compiled[i].trim().includes(".val()")){
			compiled[i] = compiled[i].trim().replace(".val()",".value");
		}
		if(compiled[i].trim().includes(".html()")){
			compiled[i] = compiled[i].trim().replace(".html()",".innerHTML");
		}
		if(compiled[i].trim().includes(".text()")){
			compiled[i] = compiled[i].trim().replace(".text()",".innerText");
		}

		if(compiled[i].trim().includes(".on(")){
			compiled[i] = compiled[i].trim().replace(".on(",".addEventListener(");
		}
		if(compiled[i].includes(".val(")){
			let param1 = compiled[i].replace(".val(",".value = ");
			let param2 = param1.split("");
			param2[param1.indexOf(")",param1.indexOf(".value = ")+9)] = "";

			compiled[i] = param2.join("");
		}
		if(compiled[i].includes(".html(")){
			let param1 = compiled[i].replace(".html(",".innerHTML = ");
			let param2 = param1.split("");
			param2[param1.indexOf(")",param1.indexOf(".innerHTML = ")+13)] = "";
			
			compiled[i] = param2.join("");
		}
		if(compiled[i].includes(".text(")){
			let param1 = compiled[i].replace(".text(",".innerText = ");
			let param2 = param1.split("");
			param2[param1.indexOf(")",param1.indexOf(".innerText = ")+13)] = "";
			
			compiled[i] = param2.join("");
		}
		if(compiled[i].trim().startsWith("@stop")){
			compiled[i] = "/*";
			compiled.push("*/");
		}
        
        //reg rule
        re = /(a)(?=(?:[^"|']|"[^"|']*")*$)/;

        if((re.exec(compiled[i])) != null){
            //console.log(compiled[i]);
        }

        //string reverse
        if(compiled[i].trim().includes("[::-1]")){
            let line = compiled[i].trim();
            compiled[i] = line.replace("[::-1]",".toString().split('').reverse().join('')");
        }
		
		//Selector
		if(compiled[i].fix().includes("@(") && compiled[i].fix().charAt(3) != ")" && compiled[i].fix().includes(")")){
			let line = compiled[i].fix();
			compiled[i] = compiled[i].fix().replace("@(","document.querySelector(")
		}
		if(compiled[i].trim().includes("@find(")){
			compiled[i] = compiled[i].trim().replace("@find(","find_element(");
		}
		if(compiled[i].trim().includes("@finds(")){
			compiled[i] = compiled[i].trim().replace("@finds(","finds_element(");
		}

		

        //Default
        compiled[i] = compiled[i].trim();
        

        //Error Detectors
        if(i == (compiled.length-1)){
        	if(jumpC != 0){
        		compiled = ["throw('@jump and @land not closed')"];
        	}
        	if(cssC != 0){
        		compiled = ["throw('@css not closed')"];
        	}
        	if(runC != 0){
        		compiled = ["throw('@run not closed')"];
        	}
        }
	}
	return compiled.join("\n");
  }
  this.version = "1.0";
}

/*

var re = /bar/g,
str = "foobarfoobarfoobarfoobar";
let match = re.exec(str)
console.log("match found at " + match.index);


*/

//function for importing modules
//code from webroidJs

function importJS(url){
	let data = "";
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (this.status == 200) {
        data = this.response;
      }else{
        data = "throw('Import Error: "+xhr.status+"')";
      }
    }
    xhr.open('GET', url, false);
    xhr.send();
    return data;
}

function importFunction(func){
   let scriptBuilder = '';
   this.fromModule = function(url){
    if(func == '*'){
      scriptBuilder = importJS(url);
    }
    var funcs = func.split(',');
    
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        if (this.status == 200) {
          var script = this.response;
          var script = script.split('\n');
          
          var searching = 0;
          var stopedAt = 0;
          var line = 0;
          var stop = false;
          var bracket1 = 0;
          var bracket2 = 0;
          
          for(i=0;i<funcs.length;i++){
            var word = funcs[searching];
            //console.log('searching for '+word)
            for(j=0;j<script.length;j++){
              stop = false;
              bracket1 = 0;
              bracket2 = 0;
              codeInline = script[j];

              if(codeInline.includes('function ' + word + '(') || codeInline.includes(word + ' = (') || codeInline.includes('func ' + word + '(') || codeInline.includes(word + ' = (')){
                //Add webroid comment
                scriptBuilder += '\n //' + word + ' Imported with LilScript \n \n';
                while(!stop){
                  codeInline = script[j];
                  
                  if (codeInline.includes('}') && codeInline.includes('{') && !codeInline.startsWith('//')) {
                    bracket1++;
                    bracket2++;
                  }else if(codeInline.endsWith('{') && !codeInline.startsWith('//')){
                    bracket1++;
                  }else if(codeInline.includes('}') && !codeInline.endsWith(';') && !codeInline.startsWith ('//')){
                    bracket2++;
                  }
                  
                  if(bracket1 == bracket2 && (bracket1+bracket2)%2 == 0){
                    stop = true;
                  }
                  scriptBuilder += (codeInline + '\n');
                  j++;
                }
                stopedAt = j+1;
              }
            }
            searching++;
          }
          /*
          var importedJS = document.createElement('script');
          importedJS.setAttribute('src', 'data:application/javascript;base64,' + btoa(ls.run(scriptBuilder)))
          document.body.appendChild(importedJS);
          this.dispatchEvent(evnt);
          */
        } else {
          scriptBuilder = "throw('Import Error: "+xhr.status+"')";
        }
        return this;
      }
      xhr.open('GET', url, false);
      xhr.send();
      return scriptBuilder;
  }
  return this;
}

//Finding Elements with text on them
function find_element(text){
    let elems =  document.querySelectorAll("*");
    let len = elems.length;
    let value = text.trim();

    let val_elems = ["input","textarea","button","option","progress","li","meter","param"];
    let elem_found;
    
    for(i=0;i<len;i++){
        let elem = elems[i];
        if(elem.value != undefined && (elem.value != 0 && elem.tagName.toLowerCase() != "li")){
            if(elem.value.trim() == value){
                elem_found = elem;
                i = len;
            }
        }
        if(elem.innerHTML != undefined){
            if(elem.innerHTML.trim() == value){
                elem_found = elem;
                i = len;
            }
        }
    }
    if(elem_found == undefined){
        return null;
    }
    return elem_found;
}

//Multiple
function finds_element(text){
    let elems =  document.querySelectorAll("*");
    let len = elems.length;
    let value = text.trim();

    let elems_found = [];
    
    for(i=0;i<len;i++){
        let elem = elems[i];
        if(elem.value != undefined && (elem.value != 0 && elem.tagName.toLowerCase() != "li")){
            if(elem.value.trim() == value){
                elems_found.push(elem);
            }
        }
        if(elem.innerHTML != undefined){
            if(elem.innerHTML.trim() == value){
                elems_found.push(elem);
            }
        }
    }
    if(elems_found.length == 0){
        return null;
    }
    return elems_found;
}
