import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, Subject,Subscription } from 'rxjs';
import { debounceTime, } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PromptUtilities } from "src/app/gpt3/utilities/promptUtilities"




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
  prompt: string = ''
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
  headlineConfigOptions = {
    engine: 'davinci',
    key: this.key,
    temperature: 0.5,
    topP: 1,
    bestOf: 1,
    maxTokens: 120,
    echo: false,
    stream: false,
    frequencyPenalty: 1,
    presencePenalty: 1,
    stop: '↵↵'
  }
  configOptionsObject ={
    finalOptions: this.finalOptions,
    healineOptions: this.headlineConfigOptions
  }

  initialHeadlinePrompt: string = ''
  apiCallSubscribe : Subscription = new Subscription();
  viewComp: string = 'Headline'
  headlineObject: any = {
    keywords:"",
    spin:false,
    generatedHeadlines: [],
    selectedHeadlines:[],
    showGenerateMore: false,
  }
  promptUtilities: PromptUtilities = new PromptUtilities()
  completionUrl: string = `https://api.openai.com/v1/engines/${this.finalOptions.engine}/completions`

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

  getConfigOptions = (type:string) => {
    let opts: any
    switch (type) {
      case 'MAIN': 
            opts = { ...this.configOptionsObject.finalOptions }
            break
      case 'HEADLINE': 
            opts = { ...this.configOptionsObject.healineOptions }
            break
      default: 
            opts = { ...this.configOptionsObject.finalOptions }
    }
      
    let data = Object.assign({},
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

    return data;
  }

  doAction(event: any): void {

    // if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) return;
    let element: any = document.getElementById('aa');
    console.log('element ==> ', element.innerText)
    let inputText: string = element.innerText
    inputText = inputText.trim();
    let isValid = this.validateInput(inputText)
    if (isValid) {
      console.log('valid inputText')
      const url = this.completionUrl
      
      
   let data = this.getConfigOptions('MAIN')
   data['prompt'] = inputText
    if(this.apiCallSubscribe){this.apiCallSubscribe.unsubscribe();}
     this.apiCallSubscribe = this.hitOpenAI(data).subscribe((response: any) => {
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
  onGenrateHeadline = (type: string) => {
    console.log('keywords ',this.headlineObject.keywords)
    this.headlineObject.spin = true;
    if (type == 'NEW') {
      let keywords = this.headlineObject.keywords && this.headlineObject.keywords.split(',')
      let promptText = this.promptUtilities.headlinePromptV1
      if (keywords.length == 1) {
        promptText = promptText.replace('##NUMOF##', '5')
        promptText = promptText.replace('##KEYWORD1##', keywords[0])
        promptText = promptText + '\n 1.'
        console.log('promptt ', promptText)
        this.initialHeadlinePrompt = promptText
        this.generateHeadlines(promptText)
      }
      else if (keywords.length == 2) {
        promptText = promptText + this.promptUtilities.headlinePromptV1Extend
        promptText = promptText.replace('##NUMOF##', '5')
        promptText = promptText.replace('##KEYWORD1##', keywords[0])
        promptText = promptText.replace('##KEYWORD2##', keywords[1])
        promptText = promptText + '\n 1.'
        console.log('promptt ', promptText)
        this.initialHeadlinePrompt = promptText
        this.generateHeadlines(promptText)
      }
    }
    else if(type == 'MORE'){
      let promptText = this.initialHeadlinePrompt
      let selectedHeadlines = this.headlineObject.selectedHeadlines
      selectedHeadlines.forEach((h:any, index:any) => {
        promptText = index == 0 ? promptText + h.text.split('.')[1] :  promptText + '\n '+ (index+1) + '. ' + h.text.split('.')[1]
      })
      console.log('promptt ', promptText)
      this.generateHeadlines(promptText)
    }
    
  }

  generateHeadlines = (promptText: string) => {
    let options = this.getConfigOptions('HEADLINE')
    options['prompt'] = promptText
    if(this.apiCallSubscribe){this.apiCallSubscribe.unsubscribe();}
     this.apiCallSubscribe =  this.hitOpenAI(options).subscribe((response:any) =>{
       console.log('headlines response ',response)
       this.headlineObject.spin = false
       if(response && response.choices){
         let choices = response.choices[0].text && response.choices[0].text.split('\n')
        choices.forEach((e:any, index:number)=> {
          if(e.length){
            let headline:any = {
              text:index === 0 ? '1. ' +  e : e,
              checked:false
            }
            this.headlineObject.generatedHeadlines.push(headline)
          }
        })
        console.log('headlineObject => ',this.headlineObject)
        this.cdr.detectChanges();
      }
      },(error)=>{
        console.log('error in generateHeadlines ',error)
        this.headlineObject.spin = false
      })
  }

  // onGenrateMoreHeadline: () =>{

  // }
  onChecked = (index:number) =>{
    this.headlineObject.generatedHeadlines[index].checked = !this.headlineObject.generatedHeadlines[index].checked
    this.headlineObject.selectedHeadlines = this.headlineObject.generatedHeadlines.filter((h:any) => {return h.checked})
    this.headlineObject.showGenerateMore = this.headlineObject.selectedHeadlines.length > 0
    console.log('checked ',this.headlineObject)
  }

  hitOpenAI = (options:any) :Observable<any> => {
    this.prompt = options['prompt']
    let url = this.completionUrl;
    const headers = new HttpHeaders(
      {
          'Authorization': `Bearer ${this.finalOptions.key}`,
          'Content-Type': 'application/json'
      }
    ) 

    return this.http.post(url,options, {headers: headers})

  }


}


