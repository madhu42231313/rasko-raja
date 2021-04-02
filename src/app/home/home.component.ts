import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PromptUtilities } from "src/app/gpt3/utilities/promptUtilities"
import { optionObject } from "src/app/gpt3/utilities/promptUtilities"
import { AngularEditorConfig } from '@kolkov/angular-editor';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  selectedItemName: string = 'home';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) { }
  selectedItem(name: string) {
    this.selectedItemName = name;
  }

  // TEST
headlines = [
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
  {text:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',checked: false},
]
  // TEST 

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
    maxTokens: 150,
    echo: false,
    stream: false,
    frequencyPenalty: 0.51,
    presencePenalty: 0.6,
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
  introOptions = {
    engine: 'davinci',
    key: this.key,
    temperature: 0.75,
    topP: 1,
    bestOf: 1,
    maxTokens: 300,
    echo: false,
    stream: false,
    frequencyPenalty: 1,
    presencePenalty: 1,
    stop: '↵↵'
  }
  configOptionsObject = {
    finalOptions: this.finalOptions,
    healineOptions: this.headlineConfigOptions,
    introOptions: this.introOptions
  }

  initialHeadlinePrompt: string = ''
  initialIntroPrompt: string = ''
  apiCallSubscribe: Subscription = new Subscription();
  viewComp: string = 'HEADLINE'
  headlineObject: any = {
    keywords: "",
    spin: false,
    generatedHeadlines: [],
    selectedHeadlines: [],
    showGenerateMore: false,
    keyWordErr: false,
    keywordErrMsg: "",
    showContinue: false,
    inputList: [],
    filteredList: []
  }
  introObject: any = {
    description: "",
    spin: false,
    disable: true,
    generatedIntros: [],
    selectedIntros: [],
    showGenerateMore: false,
    showContinue: false,
    filteredIntroList: []
  }
  promptUtilities: PromptUtilities = new PromptUtilities()
  completionUrl: string = `https://api.openai.com/v1/engines/${this.finalOptions.engine}/completions`;

  editorContent: string = ""
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '500px',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: 'auto',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo','undo',
      'redo','strikeThrough','subscript',
      'superscript', 'fontName','customClasses','insertHorizontalRule','removeFormat', 'unlink', ],
      // [
      //   'fontSize',
      //   'textColor',
      //   'backgroundColor',
      //   'customClasses',
      //   'link',
      //   'unlink',
      //   'insertImage',
      //   'insertVideo',
      //   'insertHorizontalRule',
      //   'removeFormat',
      //   'toggleEditorMode'
      // ]
    ]
  };
  copyObject = {
    spin: false,
    viewContent: "",
    textContent: ""
  }

  @ViewChild('angularEditor', {read: ElementRef}) angularEditor: any;

  ngOnInit(): void {
    this.updateViewComp('copy')
    // this.headlineObject.generatedHeadlines = this.headlines
    this.subject.pipe(debounceTime(1500))
      .subscribe((event: any) => {
        this.doAction()
      })
  }

  ngAfterViewInit(): void {
    this.formatDocumentDOM()
  }

  formatDocumentDOM() {
    let angularEditorWrapper = this.angularEditor.nativeElement.childNodes[0].childNodes[2];
    let defaultPlaceholderSpan = angularEditorWrapper.childNodes[1];
    angularEditorWrapper.removeChild(defaultPlaceholderSpan); //Removing defaultPlaceholderSpan from angularEditorWrapper.
    setTimeout(() => {
      angularEditorWrapper.childNodes[0].appendChild(defaultPlaceholderSpan); //Adding defaultPlaceholderSpan inside Editor box.
      let overview = new DOMParser().parseFromString('<div style="min-height: 500px;height: auto;width: 25%;"><b (click)="this.test()">Hello!</b></div>', 'text/html');
      let overviewNode = overview.childNodes[0].childNodes[1].childNodes[0] 
      angularEditorWrapper.prepend(overviewNode);
      let boldElement = overviewNode.childNodes[0]; 
      boldElement.addEventListener('click', ()=> {
        this.test();
      })
    }, 1000);
  }

  test() {
    alert("jhi");
  }


  keyWordEnter = () => {
    let keywordList = this.headlineObject.keywords.split(',')
                      .filter((e:string) => {return e && e.length})
    // console.log('keywordList ',keywordList)
    this.headlineObject.inputList = keywordList
  }
  validateKeywords = () => {
    let keywordList = this.headlineObject.keywords.split(',')

    if (!keywordList.length) return false;

    if (keywordList.length > 5) {
      this.headlineObject.keywordErrMsg = "Max 5 keywords will be allowed"
      this.headlineObject.keyWordErr = true;
      return false;
    }
    else if (keywordList.length < 2) {
      this.headlineObject.keywordErrMsg = "Please enter atleast two keywords"
      this.headlineObject.keyWordErr = true;
      return false
    } else {
      this.headlineObject.keyWordErr = false;
      return true;
    }
  }
  detectChanges = () => {
    this.cdr.detectChanges()
  }

  renderIntroList = (introList: optionObject[]) => {
    this.introObject.spin = false;
    this.introObject.generatedIntros = introList
    this.detectChanges()
  }
  renderHealineList = (headlineList: optionObject[]) => {
    this.headlineObject.spin = false;
    this.headlineObject.generatedHeadlines = headlineList
    this.detectChanges()
  }
  
  performIntroGen = (prompt: string) => {
    // Generate Intros first
    this.generateIntro(prompt)
      .then((res: any) => {
        this.validateGeneratedIntros(res)
          .then((validatedRes: any) => {
            let introList: optionObject[] = this.introObject.filteredIntroList
            if (validatedRes && validatedRes.length) {
              introList = introList.concat(validatedRes)
              this.introObject.filteredIntroList = [...introList]
            }
            if (introList.length >= 2) {
              this.renderIntroList(introList)
            } else {
              this.onGenerateIntro('NEW')
            }
          })
          .catch((e) => {
            this.introObject.spin = false
            console.error(e)
          })
      }).catch((e) => {
        this.introObject.spin = false
        console.error(e)
        /// show an alert if need
      })
  }

  onGenerateIntro = (type: string) => {
    this.introObject.spin = true
    if (type == 'NEW') {
      let prompt = this.promptUtilities.introSummaryPrompt
      let headline = this.headlineObject.selectedHeadlines[0]
      let description = this.introObject.description
      prompt = prompt.replace('##HEADLINE##', headline.text)
      prompt = prompt.replace('##DESCRIPTION##', description)
      this.performIntroGen(prompt)
    }
    else if (type == 'MORE') {
      let prompt = this.initialIntroPrompt
      let selectedIntros = this.introObject.selectedIntros
      selectedIntros.forEach((i: any, index: any) => {
        let sNo = ++index
        prompt = prompt + '\n' + sNo + '. ' + i.text
      })
      console.log('promptt ', prompt)
      this.performIntroGen(prompt)

    }
  }
  generateIntro = (prompt: string) => {
    return new Promise((resolve, reject) => {
      let options: any = this.getConfigOptions('INTRO')
      options['prompt'] = prompt
      let generatedIntros: optionObject[] = []
      if (this.apiCallSubscribe) { this.apiCallSubscribe.unsubscribe(); }
      this.apiCallSubscribe = this.hitOpenAI(options).subscribe((response: any) => {
        console.log('response', response)
        // this.introObject.spin = false
        if (response && response.choices) {
          let choices = response.choices[0].text && response.choices[0].text.split('Introduction #')
            .filter((e: string) => { return e.length })
          //  console.log('before map --> ',choices)
          choices = choices.map((intro: string) => {
            intro = intro.trim()
            let format = intro.charAt(1) == ':' ? intro.split(':')[1] : intro
            console.log('format ', format)
            return format
          })
          //  console.log('after map --> ',choices)
          choices.forEach((e: any, index: number) => {
            if (e.length) {
              let intro: any = {
                text: e,
                checked: false
              }
              generatedIntros.push(intro)
            }
          })
          console.log('introObject => ', generatedIntros)
          resolve(generatedIntros)
          this.detectChanges();
        }
      }, (error) => {
        this.introObject.spin = false
        reject([])
        console.log("error => ", error)
      })
    })
  }

  validateGeneratedIntros = (generatedIntros: optionObject[]) => {
    return new Promise((resolve, reject) => {
      if (generatedIntros && generatedIntros.length) {
        let isValid = true
        let minIntroLen = 30
        let filterWithLength = generatedIntros.filter((i) => { return i.text.length >= minIntroLen })
        if (filterWithLength.length) {
          resolve(filterWithLength)
        } else {
          resolve([])
        }
      } else {
        this.onGenerateIntro('NEW')
      }
    })
  }
  validateGeneratedHeadlines = (generatedHeadlines: optionObject[]) => {
    return new Promise((resolve, reject) => {
      if (generatedHeadlines && generatedHeadlines.length) {
        // let isValid = true
        let minLen = 10
        let filterWithLength = generatedHeadlines.filter((i) => { return i.text.length >= minLen })
        if (filterWithLength.length) {
          resolve(filterWithLength)
        } else {
          resolve([])
        }
      } else {
        this.onGenrateHeadline('NEW')
      }
    })
  }
  onDescEnter = () => {
    this.introObject.disable = this.introObject.description.length < 50
  }

  onKeyUp(event: any) {
    if (this.apiCallSubscribe) { this.apiCallSubscribe.unsubscribe() }
    this.subject.next(event);
  }
  onCopySubmit = () => {
    console.log('editor content ', this.editorContent)
    this.doAction()
  }
  onHtml(event: any) {
    console.log("on html ", event)
    // this.html.emit(event)
  }

  _construct_parameter(name: any, value: any) {
    return (typeof value === 'undefined' || value === null) ? null : { [name]: value };
  }

  _safe_cast(number: any) {
    // number = number.toString();
    return isNaN(Number(number)) ? null : Number(number);
  }

  getConfigOptions = (type: string) => {
    let opts: any
    switch (type) {
      case 'MAIN':
        opts = { ...this.configOptionsObject.finalOptions }
        break
      case 'HEADLINE':
        opts = { ...this.configOptionsObject.healineOptions }
        break
      case 'INTRO':
        opts = { ...this.configOptionsObject.introOptions }
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
  updateViewComp = (val: string) => {
    this.viewComp = val;
    this.selectedItemName = val
    // if(val == 'COPY') this.updateInitialCopyData()
  }
  continueToIntroGen = () => {
    this.updateViewComp('intro')
  }
  continueToCopy = () => {
    let headline = this.headlineObject.selectedHeadlines[0].text
    let intro = this.introObject.selectedIntros[0].text
    // let desc = this.introObject.description
    let originalText = `${headline} \n\n ${intro} \n`;
    this.copyObject.textContent = originalText;
    let editorString = `<h2> ${headline} </h2> 
                        <br><br>
                        <br>
                        <p> ${intro} </p> <br>`
    this.editorContent = editorString;
    // this.copyObject.viewContent = 
    this.updateViewComp('copy')
    // this.updateInitialCopyData()

  }

  updateInitialCopyData = () => {
    let element: any = document.getElementById('aa');
    console.log('element ==> ', element.innerText);
    let intro = this.introObject.selectedIntros[0]
    element.innerText = intro;
  }

  removeHtmlTags = (inStr: string) => {
    let formattedStr = inStr
    formattedStr = this.replaceAll(inStr, '<br>', "\n");
    formattedStr = formattedStr.replace(/(<([^>]+)>)/ig, '');
    console.log('formatted string ', formattedStr)
    return formattedStr;
  }
  replaceAll = (string: string, search: string, replace: string) => {
    return string.split(search).join(replace);
  }

  doAction(): void {

    // if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) return;
    this.copyObject.spin = true
    // let element: any = document.getElementById('aa');
    // console.log('element ==> ', element.innerText)
    // let inputText: string = element.innerText
    this.copyObject.viewContent = this.editorContent
    let inputText: string = this.editorContent
    inputText = this.removeHtmlTags(inputText)
    inputText = inputText.trim();
    let isValid = this.validateInput(inputText)
    if (isValid) {
      console.log('valid inputText')
      const url = this.completionUrl


      let data = this.getConfigOptions('MAIN')
      data['prompt'] = inputText
      console.log('copy prompt ', inputText)
      if (this.apiCallSubscribe) { this.apiCallSubscribe.unsubscribe(); }
      this.apiCallSubscribe = this.hitOpenAI(data).subscribe((response: any) => {
        console.log('response', response)
        if (response && response.choices) {
          let resultText = ''
          response.choices.forEach((e: any) => {
            resultText += e.text
          })

          // element.innerText = inputText + resultText;
          this.editorContent = this.copyObject.viewContent + resultText;
          this.copyObject.spin = false
          this.detectChanges();
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
    console.log('keywords ', this.headlineObject.keywords)
    let isValid = this.validateKeywords()
    if (isValid) {
      this.headlineObject.spin = true;
      if (type == 'NEW') {
        let keywords = this.headlineObject.keywords && this.headlineObject.keywords.split(',')
        let promptText = this.promptUtilities.headlinePromptV1
        promptText = promptText.replace('##NUMOF##', '5')
        if (keywords.length) {
          promptText = promptText.replace('##KEYWORD1##', keywords[0])
          if (keywords.length > 1) {
            let extendPromptText = this.promptUtilities.headlinePromptV1Extend
            for (let i = 1; i < keywords.length; i++) {
              let p = extendPromptText
              p = p.replace('##KEYWORD##', keywords[i])
              promptText = promptText + ' ' + p
            }
          }
          this.initialHeadlinePrompt = promptText;
          promptText = promptText + '\n 1.'
          console.log('prompt ', promptText)
          this.performHeadlineGen(promptText)
        }
      }
      else if (type == 'MORE') {
        let promptText = this.initialHeadlinePrompt
        let selectedHeadlines = this.headlineObject.selectedHeadlines
        selectedHeadlines.forEach((h: any, index: any) => {
          let sNo = ++index
          promptText = promptText + '\n' + sNo + '. ' + h.text
        })
        console.log('promptt ', promptText)
        this.performHeadlineGen(promptText)
      }
    }
  }

  performHeadlineGen = (prompt : string) =>{
    this.generateHeadlines(prompt)
    .then((res:any)=>{
      this.validateGeneratedHeadlines(res)
      .then((validatedRes: any)=>{
        let headlineList: optionObject[] = this.headlineObject.filteredList
            if (validatedRes && validatedRes.length) {
              headlineList = headlineList.concat(validatedRes)
              this.headlineObject.filteredList = [...headlineList]
            }
            if (headlineList.length >= 2) {
              this.renderHealineList(headlineList)
            } else {
              this.onGenrateHeadline('NEW')
            }
      })
      .catch(err=>{
        this.headlineObject.spin = false
        console.log(err)
      })

    })
    .catch(e => {
      this.headlineObject.spin = false
      console.log(e)
    })
  }

  generateHeadlines = (promptText: string) => {
    return new Promise((resolve , reject)=>{
      let options = this.getConfigOptions('HEADLINE')
      options['prompt'] = promptText
      let generatedHeadlines: optionObject[] = []
      if (this.apiCallSubscribe) { this.apiCallSubscribe.unsubscribe(); }
      this.apiCallSubscribe = this.hitOpenAI(options).subscribe((response: any) => {
        console.log('headlines response ', response)
        this.headlineObject.spin = false
        if (response && response.choices) {
          let choices = response.choices[0].text && response.choices[0].text.split('\n')
            .filter((e: string) => { return e.length > 3 })
          //  console.log('before map --> ',choices)
          choices = choices.map((head: string) => {
            let splitArray = head.split('.')
            return splitArray.length > 1 ? splitArray[1] : splitArray[0]
          })
          //  console.log('after map --> ',choices)
          choices.forEach((e: any, index: number) => {
            if (e.length) {
              let headline: any = {
                text: e,
                checked: false
              }
              generatedHeadlines.push(headline)
            }
          })
          // console.log('headlineObject => ', this.headlineObject)
          resolve(generatedHeadlines)
          // this.detectChanges();
        }
      }, (error) => {
        console.log('error in generateHeadlines ', error)
        this.headlineObject.spin = false
        resolve([])
      })

    })
  }

  // onGenrateMoreHeadline: () =>{

  // }
  onChecked = (index: number) => {
    this.headlineObject.generatedHeadlines[index].checked = !this.headlineObject.generatedHeadlines[index].checked
    this.headlineObject.selectedHeadlines = this.headlineObject.generatedHeadlines.filter((h: any) => { return h.checked })
    this.headlineObject.showGenerateMore = this.headlineObject.selectedHeadlines.length > 0
    this.headlineObject.showContinue = this.headlineObject.selectedHeadlines.length === 1
    console.log('checked ', this.headlineObject)
  }
  onIntroChecked = (index: number) => {
    this.introObject.generatedIntros[index].checked = !this.introObject.generatedIntros[index].checked
    this.introObject.selectedIntros = this.introObject.generatedIntros.filter((h: any) => { return h.checked })
    this.introObject.showGenerateMore = this.introObject.selectedIntros.length > 0
    this.introObject.showContinue = this.introObject.selectedIntros.length === 1
    console.log('checked ', this.introObject)
  }

  hitOpenAI = (options: any): Observable<any> => {
    this.prompt = options['prompt']
    let url = this.completionUrl;
    const headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.finalOptions.key}`,
        'Content-Type': 'application/json'
      }
    )

    // let apiURL = "http://localhost:7788/api/"
    // let url = apiURL + "fetch"
    let encryptedOptions = crypto.AES.encrypt(JSON.stringify(options), 'P@$$wordRASKOR@J@')
    let reqOptions = {"reqOptions": encryptedOptions.toString()}
    console.log('encrypted ', reqOptions)
    return this.http.post(url, options, { headers: headers })
    // return this.http.post(url, reqOptions)

  }
}
