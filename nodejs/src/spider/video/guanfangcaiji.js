import req from '../../util/req.js';
import CryptoJS from 'crypto-js';


let home_url = 'http://39.105.18.5:5565/api.php/app';

let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36',
}


/**
 * 发送 HTTP 请求的通用方法
 * @param {string} reqUrl - 请求地址（必填）
 * @param {object} [headers={}] - 请求头配置
 * @param {object} [body=null] - 请求体数据（POST/PUT 等方法时使用）
 * @param {string} [method='get'] - 请求方法（get/post/put/delete 等）
 * @returns {Promise<any>} - 响应数据（根据 Content-Type 自动处理，可能是 object/string/ArrayBuffer 等）
 */
async function request(reqUrl, headers = {},body = null, method = 'get') {
    // 1. 基础参数校验
    if (!reqUrl || typeof reqUrl !== 'string') {
        throw new Error('请求地址（reqUrl）必须是有效的字符串');
    }
    if (headers && typeof headers !== 'object') {
        throw new Error('请求头（headers）必须是对象类型');
    }
    if (typeof method !== 'string') {
        throw new Error('请求方法（method）必须是字符串类型');
    }

    // 2. 标准化请求方法（转为小写，避免大小写问题）
    const normalizedMethod = method.toLowerCase();

    // 3. 处理请求配置
    const config = {
        url: reqUrl,
        method: normalizedMethod,
        headers: {
            // 'Content-Type': 'application/json', // 默认 JSON 格式
            ...headers // 允许用户传入的 headers 覆盖默认值
        }
    };

    // 4. 根据请求方法处理请求体（GET/HEAD 等方法没有请求体）
    const noBodyMethods = ['get', 'head', 'options'];
    if (!noBodyMethods.includes(normalizedMethod) && body !== null) {
        // 自动序列化 JSON 数据（如果是对象类型）
        config.data = typeof body === 'object' ? JSON.stringify(body) : body;
    }

    try {
        // 5. 发送请求并返回响应数据
        const response = await req(config);
        return response.data;
    } catch (error) {
        // 6. 错误处理（区分网络错误、响应错误等）
        let errorMsg = '请求失败';
        if (error.response) {
            // 服务器返回了响应（状态码非 2xx）
            errorMsg = `[${error.response.status}] ${error.response.statusText || '服务器错误'}`;
        } else if (error.request) {
            // 没有收到响应（网络错误等）
            errorMsg = '网络错误，未收到服务器响应';
        } else {
            // 请求配置错误
            errorMsg = `请求配置错误：${error.message}`;
        }
        // 抛出错误，让调用方处理
        throw new Error(`${errorMsg}（地址：${reqUrl}）`);
    }
}
function aes_decrypt(data, _key, _iv) {
    const key = CryptoJS.enc.Utf8.parse(_key);
    const iv = CryptoJS.enc.Utf8.parse(_iv);
    const decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

async function jx_1(url) {
    const body = `url=${url}&time=` + (Date.now() / 1000).toString().split('.')[0];
    const header = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "accept-language": "zh-CN,zh;q=0.9",
        "origin": "https://jiexi.789jiexi.net:4433",
    };
    const data = await request('https://jiexi.789jiexi.net:4433/api.php',header, body, 'post');
    if (data.msg === '请求成功') {
        return [true, aes_decrypt(data.url, 'ARTPLAYERliUlanG', 'ArtplayerliUlanG')];
    }
    return [false, '']
}


async function init(_inReq, _outResp) {
    return {};
}

// 主页分类
async function home(_inReq, _outResp) {
    console.log(_inReq);
    console.log(_inReq);
    const json_data = await request(home_url + '/nav', headers);
    // console.log(json_data);
    let return_data = {
        'class': [],
        'filters': {}
    }
    json_data.list.forEach((i) => {
        return_data.class.push({
            'type_id': i.type_id.toString(),
            'type_name': i.type_name
        })
    })
    return return_data;
}

//主页推荐
async function homeVod() {
    // const json_data = await request(home_url + '/api.php/provide/vod?ac=detail');
    let return_data = {'list': [], 'parse': 0, 'jx': 0}

    // json_data.list.forEach(function (i) {
    //     return_data.list.push(
    //         {
    //             'vod_id': i.vod_id,
    //             'vod_name': i.vod_name,
    //             'vod_pic': i.vod_pic,
    //             'vod_remarks': i.vod_remarks,
    //         }
    //     )
    // })
    return JSON.stringify(return_data)
}


//分类
async function category(_inReq, _outResp) {
    const tid = _inReq.body.id;
    const pg = _inReq.body.page;
    let return_data = {'list': [], 'parse': 0, 'jx': 0}
    const json_data = await request(home_url + `/video?tid=${tid}&pg=${pg}`, headers);
    json_data.list.forEach(function (i) {
        return_data.list.push(
            {
                'vod_id': i.vod_id.toString(),
                'vod_name': i.vod_name,
                'vod_pic': i.vod_pic,
                'vod_remarks': i.vod_remarks
            }
        )
    })
    return return_data;
}

//详情
async function detail(_inReq, _outResp) {
    // const ids = !Array.isArray(_inReq.body.id) ? [_inReq.body.id] : _inReq.body.id;
    const id = _inReq.body.id;
    let return_data = {'list': [], 'parse': 0, 'jx': 0}
    const json_data = await request(home_url + `/video_detail?id=${id}`,headers);
    const i = json_data.data;
    return_data.list.push(
        {
            'type_name': i.type_name,
            'vod_id': i.vod_id.toString(),
            'vod_name': i.vod_name,
            'vod_remarks': i.vod_remarks,
            'vod_year': i.vod_year,
            'vod_area': i.vod_area,
            'vod_actor': i.vod_actor,
            'vod_director': i.vod_director,
            'vod_content': i.vod_content,
            'vod_play_from': i.vod_play_from,
            'vod_play_url': i.vod_play_url,

        })
    return return_data
}

//播放
async function play(_inReq, _outResp) {
    const id = _inReq.body.id;
    const flag = _inReq.body.flag;
    let return_data = {
        'url': '',
        'parse': 0,
        'jx': 0,
        'header': {
            'User-Agent': 'Mozilla/5.0',
        }
    }
    if (flag !== 'dyttm3u8') {
        const info = await jx_1(id);
        if (info[0]){
            return_data.url =  info[1];
        }
    }
    if (flag === 'dyttm3u8') {
        return_data.url = id;

    }

    return return_data
}

//搜索
async function search(_inReq, _outResp) {
    const wd = _inReq.body.wd;
    let return_data = {'list': [], 'parse': 0, 'jx': 0}
    const json_data = await request(home_url + `/search?text=${wd}`,headers);
    json_data.list.forEach(function (i) {
        return_data.list.push(
            {
                'vod_id': i.vod_id,
                'vod_name': i.vod_name,
                'vod_pic': i.vod_pic,
                'vod_remarks': i.vod_remarks
            }
        )
    })
    return return_data
}

function log(...args) {
    // ...args 会收集所有传入的参数，形成一个数组
    // 使用扩展运算符 ... 将数组展开为多个参数，传递给 console.log
    console.log(...args);
}
export default {
    meta: {
        key: 'guan_fang_cai_ji',
        name: '官方采集',
        type: 3,
    },
    api: async (fastify) => {
        fastify.post('/init', init);
        fastify.post('/home', home);
        fastify.post('/category', category);
        fastify.post('/detail', detail);
        fastify.post('/play', play);
        fastify.post('/search', search);
    },
};

