# coding:utf-8
import json
from flask import Flask, make_response
from flask_cors import *
app = Flask(__name__)
CORS(app, supports_credentials=True)

def make_resp(ret):
    resp = make_response(json.dumps(ret))
    resp.mimetype = 'application/json'
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/', methods=['GET'])
def bye():
    return 'LearnMAppDev AI Service v0.1'

@app.route('/demo', methods=['GET'])
def demo():
    return 'Not permitted!'

@app.route('/demo/news', methods=['GET'])
def demo_news():
    return 'Not permitted!'

@app.route('/demo/news/type', methods=['GET','POST'])
def demo_news_type():
    ret =  [
        {"category":"all","name":"热点"},
        {"category":"1","name":"社会"},
        {"category":"2","name":"娱乐"},
        {"category":"3","name":"科技"},
        {"category":"4","name":"汽车"},
        {"category":"5","name":"财经"}
    ]
    rsp = make_resp(ret)
    return rsp

@app.route('/demo/news/list', methods=['GET','POST'])
def demo_news_list():
    ret = [{
        "title": "title1", "has_image": False,
        "comment_count": 5, "publish_time": "2020-03-09 9:25"
    }, {
        "title": "title2", "has_image": False,
        "comment_count": 15, "publish_time": "2020-03-09 7:34"
    }, {
        "title": "title3", "has_image": True,
        "image_list": [{ "url": "../../images/avatar.png" }, { "url": "../../images/avatar.png" }, { "url": "../../images/avatar.png" }],
        "comment_count": 25, "publish_time": "2020-03-08 19:25"
    }, {
        "title": "title4", "has_image": False,
        "comment_count": 8, "publish_time": "2020-03-08 19:20"
    }]
    rsp = make_resp(ret)
    return rsp

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8888)