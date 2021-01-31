import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject,Subscription } from 'rxjs';
import { debounceTime, } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';




@Component({
  selector: 'app-gpt3',
  templateUrl: './gpt3.component.html',
  styleUrls: ['./gpt3.component.scss']
})
export class Gpt3Component implements OnInit {

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  subject: Subject<any> = new Subject();
  key: string = 'sk-gnpHgNlj1nyLOIPUJShUjPkllzh19Tktx3e6eHpV'
  finalOptions = {
    // prompt: trainData,
    engine: 'davinci',
    key: this.key,
    temperature: 0.9,
    topP: 1,
    bestOf: 1,
    maxTokens: 100,
    echo: false,
    stream: false,
    frequencyPenalty: 1,
    presencePenalty: 1,
    stop: '↵↵'

  }

  apiCallSubscribe : Subscription = new Subscription();


  ngOnInit(): void {
    this.subject.pipe(debounceTime(1500))
      .subscribe((event: any) => {
        this.doAction(event)
      })
  }
  // onKeyUp(event:any){
  //   console.log(event);
  // }

  onKeyUp(event: any) {
    if(this.apiCallSubscribe){this.apiCallSubscribe.unsubscribe()}
    this.subject.next(event);
  }

  _construct_parameter(name: any, value: any) {
    return (typeof value === 'undefined' || value === null) ? null : { [name]: value };
  }

  _safe_cast(number : any) {
    // number = number.toString();
    return isNaN(Number(number)) ? null : Number(number);
  }

  doAction(event: any): void {

    if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) return;
    let element: any = document.getElementById('aa');
    let maxSize = 20;
    let childNodes = element.childNodes;
    console.log('element ==> ', element.innerText)
    let inputText: string = element.innerText
    inputText = inputText.trim();
    let isValid = this.validateInput(inputText)
    if (isValid) {
      console.log('valid inputText')
      const url = `https://api.openai.com/v1/engines/${this.finalOptions.engine}/completions`;
      const headers = new HttpHeaders(
        {
            'Authorization': `Bearer ${this.finalOptions.key}`,
            'Content-Type': 'application/json'
        }
      ) 
      let opts : any = {...this.finalOptions}
      let data = Object.assign({},
        this._construct_parameter("prompt", inputText),
        this._construct_parameter("stream", opts.stream),
        this._construct_parameter("stop", opts.stop),
        this._construct_parameter("max_tokens", this._safe_cast(opts.maxTokens)),
        this._construct_parameter("temperature", this._safe_cast(opts.temperature)),
        this._construct_parameter("top_p", this._safe_cast(opts.topP)),
        this._construct_parameter("presence_penalty", this._safe_cast(opts.presencePenalty)),
        this._construct_parameter("frequency_penalty", this._safe_cast(opts.frequencyPenalty)),
        this._construct_parameter("best_of", this._safe_cast(opts.bestOf)),
        this._construct_parameter("n", this._safe_cast(opts.n)),
        this._construct_parameter("logprobs", this._safe_cast(opts.logprobs)),
        this._construct_parameter("echo", opts.echo),
    );
    // data = JSON.parse(data)
    if(this.apiCallSubscribe){this.apiCallSubscribe.unsubscribe();}
     this.apiCallSubscribe = this.http.post(url,data, {headers: headers}).subscribe((response: any) => {
        console.log('response', response)
        if(response && response.choices){
          let resultText = ''
          response.choices.forEach((e:any)=> {
              resultText += e.text
          })

          element.innerText = inputText + resultText;
          this.cdr.detectChanges();
        }
      })


    }


  }
  validateInput = (inputText: string): boolean => {
    let isValid: boolean = false;
    isValid = inputText && inputText.length >= 15 ? true : false
    return isValid;
  }
  alignElement(element: any, event: any) {
    let childNodes = element.childNodes;
    let size = childNodes.length;
    for (let i = 0; i < size; i++) {
      if (childNodes[i].nodeName == 'DIV') {

        let text = childNodes[i].nodeValue;
        let size1 = text.length;
        let content = '';
        for (let i = 0; i < size1; i++) {
          if (i < 20) {
            if (i == 0) {
              content = content + `<span id=${i}>` + 'ENTER' + `</span>`;
            } else {
              content = content + `<span id=${i}>` + text[i] + `</span>`;
            }
          } else {
            content = content + `<span id=${i} style="color:red;">` + text[i] + `</span>`;
          }
        }
        element.innerHTML = content;

      } else {
        let text = childNodes[i].nodeValue;
        let size1 = text && text.length || 0;
        let content = '';
        for (let i = 0; i < size1; i++) {
          if (i < 20) {
            content = content + `<span id=${i}>` + text[i] + `</span>`;
          } else {
            content = content + `<span id=${i} style="color:red;">` + text[i] + `</span>`;
          }
        }
        element.innerHTML = content;
      }
      return element;
    }
  }
  // let text = element.innerText;
  // let size = text.length;
  // let content = '';
  // for(let i=0;i<size;i++) {   
  //   if(i < 20) {
  //     content = content + `<span id=${i}>`+text[i]+`</span>`;
  //   } else {
  //   content = content + `<span id=${i} style="color:red;">`+text[i]+`</span>`;
  //   } 
  // }
  // element.innerHTML = content;
  // return element;
  // }
  redSpaces(element: any, event: any) {
    let childNodes = element.childNodes;
    let size = childNodes.length;
    for (let i = 0; i < size; i++) {
      if (childNodes[i].innerHTML == '&nbsp;' || childNodes[i].innerHTML == ' ') {
        if (i == 0 && childNodes[i + 1] && (childNodes[i + 1].innerHTML == '&nbsp;' || childNodes[i + 1].innerHTML == ' ')) {
          childNodes[i].classList.add("highlight");
          childNodes[i + 1].classList.add("highlight");
        }
        else {
          if (childNodes[i - 1] && (childNodes[i - 1].innerHTML == '&nbsp;' || childNodes[i - 1].innerHTML == ' ') && (childNodes[i].innerHTML == '&nbsp;' || childNodes[i].innerHTML == ' ')) {
            childNodes[i].classList.add("highlight");
            childNodes[i - 1].classList.add("highlight");
          }
          if (childNodes[i + 1] && (childNodes[i + 1].innerHTML == '&nbsp;' || childNodes[i + 1].innerHTML == ' ') && (childNodes[i].innerHTML == '&nbsp;' || childNodes[i].innerHTML == ' ')) {
            childNodes[i + 1].classList.add("highlight");
            if (!childNodes[i].classList.contains('highlight')) {
              childNodes[i].classList.add("highlight");
            }
          }
        }
      }
    }
  }


}


