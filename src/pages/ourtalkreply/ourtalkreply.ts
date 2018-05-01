import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController,Content} from 'ionic-angular';
import {Common} from '../../providers/common';
import {Appsetting} from '../../providers/appsetting';
import {Http} from '@angular/http';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import * as moment from 'moment';
import {RealtalkPage} from '../realtalk/realtalk';
/**
 * Generated class for the TalkreplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-ourtalkreply',
    templateUrl: 'ourtalkreply.html',
})
export class OurtalkreplyPage {
    interval: number;
    @ViewChild(Content) content: Content;
    commentdata: any;
    topicdata: any;
    pageno: any = 1;
    ourtalk:FormGroup;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public loadingCtrl: LoadingController,
        public common: Common,
        public toastCtrl: ToastController,
        public appsetting: Appsetting,
        public http: Http,
        public formBuilder: FormBuilder,

    ) {
     
     this.ourtalk = this.formBuilder.group({
            comment: ['', [Validators.required]],
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OurtalkreplyPage');
        console.log(this.navParams.get('topidata'));
        this.topicdata = this.navParams.get('topidata');
        this.Topicdata();
        this.interval = setInterval(() => {
                    this.Topicdata();
                }, 10000);
        
    }
    scrollBottom(){
        this.content.scrollToBottom(300);
    }
      Topicdata() {
        var temp = this;
        let options = this.appsetting.header();
        var postdata = {
            topic_id: this.navParams.get('topidata')._id,
        }
        console.log(postdata);
        var serialized = this.appsetting.serializeObj(postdata);

        this.http.post(this.appsetting.url + 'talks/getSingleTalks', serialized, options).map(res => res.json()).subscribe(response => {
            console.log(response);
            
            if (response.status == true) {
                response.data[0].comments.forEach(function(value,key){
                    response.data[0].talk_data.forEach(function(val,ke){
                        if(value.comment_by == val._id){
                            value.firstname = val.firstname;
                            value.lastname = val.lastname;
                            if(val.profile_pic){
                            value.profile_pic = val.profile_pic;
                            }else{
                                value.profile_pic = 'assets/imgs/user.png';
                            }
                        }
                    })
                     var a = new Date();
                        console.log(new Date(value.created_at))
                        var startDate = moment(new Date(value.comment_time), "DD.MM.YYYY");
                        var endDate = moment(a, "DD.MM.YYYY");
                        var milliseconds = endDate.diff(startDate);
                        var duration = moment.duration(milliseconds, 'milliseconds');
                        
                        console.log('Hours' + duration.hours())
                        console.log('minutes' + duration.minutes());
                        if(duration.hours()>24){
                            value.days = duration.asDays();
                            value.time = 'day';
                        }else{
                        if(duration.minutes()>9){
                            if(duration.hours()>9){
                            value.days = duration.hours()+':'+duration.minutes();
                            }else{
                                value.days = '0'+duration.hours()+':'+duration.minutes();
                            }
                        }else{
                         if(duration.hours()>9){
                            value.days = duration.hours()+':'+duration.minutes();
                            }else{
                                value.days = '0'+duration.hours()+':'+duration.minutes();
                            }
                            value.days = '0'+duration.hours()+':0'+duration.minutes();
                        }
                            value.time = 'hour';
                        }
                })
                if(response.data[0].comments.length>0){
                 this.content.scrollToBottom(300);
                }
                this.commentdata = response.data[0];
                console.log(this.commentdata);
            } else {
            
            }

        })
    }
PostComment(formdata){
    console.log(formdata.value);
     let options = this.appsetting.header();
                var postdata = {
                    comment_by:JSON.parse(localStorage.getItem('CurrentUser'))._id,
                    comment_msg:formdata.value.comment,
                    topic_id:this.topicdata._id
                }
                
                console.log(postdata);
                var serialized = this.appsetting.serializeObj(postdata);
               
                    this.http.post(this.appsetting.url + 'talks/addComment', serialized, options).map(res => res.json()).subscribe(response => {
                        console.log(response);
                        if (response.status == true) {
                           //this.topicdata.comments = response.data[0].comments;
                           
                            this.ourtalk.patchValue({
                                comment:''
                            })
                             
                           this.Topicdata();
                        } else {
                            this.common.presentAlert('Login', response.message);
                        }

                    })
               // })
           
}
 back() {
      clearInterval(this.interval);
      this.navCtrl.push(RealtalkPage);
  }
}