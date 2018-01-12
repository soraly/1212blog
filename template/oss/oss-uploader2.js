'use strict';

/**
 * Uploader plugin
 *
 * @author: majinhui
 * Date:2013/11/15
 * 针对又拍云的上传组件
 所需文件：uploader.js
 注：每个form表单只能对应一个上传域
 参数说明：
 fileField：文件域(dom节点，必须有)
 form:包含文件域的表单(dom节点，必须有)
 fileType:文件类型 image(默认)  | video | photo(图片有大小限制)
 beforeStart:上传前操作函数 （返回一个对象 包含文件的基本信息：名字，后缀，全称）
 success：成功回调函数 （返回一个对象 包含文件的完整信息 result.url:文件的路径）
 fail: 失败回调函数 （返回一个错误对象  error.message: 错误信息）

 绑定：
 var uploader1 = Uploader({
			fileField:file,
			form:document.form,
			fileType:'image',
			beforeStart:function(file){
				alert(file.value);
			},
			success:function(result){
				alert(result.url);
			},
			fail:function(error){
				alert(error.message);
			}
		});
 触发上传：
 uploader1.submit();or file.uploader.submit();
 */

(function () {
    //回调函数唯一的id 自增
    var funcid = 1;
    //不同文件类型的上传时  form的action
    var uploadForm = {
        photo: '/api/1.1b/file/upyun/photo/uploadform',
        avatar: '/api/1.1b/file/upyun/avatar/uploadform',
        image: '/api/1.1b/file/upyun/image/uploadform',
        video: '/api/1.1b/file/upyun/video/uploadform',
        attachment: '/api/1.1b/file/upyun/asset/uploadform',
        asset: '/api/1.1b/file/upyun/asset/uploadform'
    };
    var fileTypeList = ['photo', 'avatar', 'image', 'video', 'asset', 'attachment'];

    //上传错误类型
    var uploadError = {
        'Not accept, Bucket not exists': '不接受请求,空间不存在',
        'Authorize has expired': '不接受请求,上传授权已过期',
        'Not accept, Miss signature': '不接受请求,缺少签名',
        'Not accept, Signature error': '签名错误',
        'Not accept, POST URI error': '不接受请求',
        'Not accept, Bucket disabled': '不接受请求,空间被禁用',
        'Not accept, Form API disabled': '不接受请求,表单 API 功能未打开',
        'Not accept, No file data': '不接受请求,没有上传文件数据',
        'Not accept, File too large': '不接受请求,上传文件过大 ',
        'Not accept, File too small': '不接受请求,上传文件过小 ',
        'Not accept, File type Error': '不接受请求,上传文件类型不允许',
        'Not accept, Content­md5 error': '不接受请求,上传文件的内容 md5 校验错误',
        'Not accept, Not a image file': '不接受请求,上传的不是图片文件',
        'Not accept, Image width too small': '不接受请求,上传的图片宽度过小 ',
        'Not accept, Image width too large': '不接受请求,上传的图片宽度过大 ',
        'Not accept, Image height too small': '不接受请求,上传的图片高度过小',
        'Not accept, Image height too large': '不接受请求,上传的图片高度过大 ',
        'Not accept, Data too long for ext-param': ' 额外参数内容过长',
        'Image Rotate Invalid Parameters': '图片旋转参数错误',
        'Image Crop Invalid Parameters': '图片裁剪参数错误',
        'System Error ... Retry again': '系统错误,请再尝试'

    };
    var uploadIframe = null;
    if (!window.console) {
        window.console = {
            log: function () { },
            dir: function () { }
        }
    }
    //创建XMLHttpRequest
    function createXhr() {
        var request = null;
        try {
            request = new XMLHttpRequest();
        }
        catch (trymicrosoft) {
            try {
                request = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (othermicrosoft) {
                try {
                    request = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (failed) {
                    request = false;
                }
            }
        }

        return request;
    }
    /*
	* ajax 组件
	*
	*/
    var http = {
        get: function (url, data, success, fail) {
            var self = this;
            var xhr = createXhr();
            var href = location.href;
            if (href.indexOf('http://') == -1) {
                alert('请在HTTP服务下运行！');
                return;
            }
            xhr.onreadystatechange = function (event) {
                var result;
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 302) {
                        result = self.parse(xhr.responseText);
                        success && success(result);

                    } else {
                        result = self.parse(xhr.responseText);
                        fail && fail(result);
                        showMessage('error');
                        showMessage(result.message + xhr.responseText)
                    }
                }
            };

            if (data) {
                for (var key in data) {
                    url = self.addURLParam(url, key, data[key]);
                }
            }

            xhr.open('get', url, true);
            xhr.send(null);

        },
        /*post:function(url,data,success,fail){
			var self=this;
			var xhr = new  XMLHttpRequest();

			xhr.onreadystatechange = function(event){
				var result;
				if(xhr.readyState ==4){
					if((xhr.status >= 200 && xhr.status <300) || xhr.status == 302){
						result = self.parse(xhr.responseText);
						success && success(result);

					}else{
						fail && fail();
						showMessage('error');
					}
				}
			};
			xhr.onprogress=function(event){
			};
			if(data){
				data = self.serialize(data);
			}else{
				data = null
			}
			xhr.open('post',url,true);
			xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
			xhr.send(data);

		},*/
        parse: function (str) {
            var data = {};
            if (window.JSON) {
                try {
                    data = JSON.parse(str);
                } catch (err) {
                    showMessage('JSON解析出错');
                }

            } else {
                try {
                    data = eval('(' + str + ')');
                } catch (err) {
                    showMessage('JSON解析出错');
                }

            }

            return data;
        },
        addURLParam: function (url, name, value) {
            url += (url.indexOf('?') == -1) ? '?' : '&';
            url += encodeURIComponent(name) + '=' + encodeURIComponent(value);
            return url;
        },
        serialize: function (data) {
            var parts = [], value;
            for (var name in data) {
                value = data[name];
                parts.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
            }

            return parts.join('&');
        }
    };

    //属性继承
    function extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        };

        return destination;

    }


    function showMessage(msg) {
        alert(msg);
    }

    function isInArray(value, arr) {

        for (var i = arr.length - 1; i >= 0; i--) {
            if (value == arr[i]) {
                return true;
            }
        };

        return false;
    }


    /*
	* 上传组件
	* 必要参数 { fileField：文件域(dom节点),form:包含文件域的表单(dom节点) }
	*/
    function Uploader(opts) {
        var opts = opts || {};

        if (!opts.fileField) {
            alert('上传文件域缺失');
            return;
        }
        if (!opts.form) {
            alert('表单form缺失');
            return;
        }

        if (!isInArray(opts.fileType, fileTypeList)) {
            alert('文件类型不正确,文件格式包括' + fileTypeList.toString());
            return;
        }

        return new Uploader.prototype.init(opts);

    }
    Uploader.prototype = {
        constructor: Uploader,

        init: function (opts) {
            var self = this;
            //继承参数
            extend(self, opts);
            /*//如果已经封装过则跳过
			if(self.fileField.uploader){
				return ;
			}*/
            self.uuid = (funcid++);
            self.iframeName = 'uploaderIframe';//上传时对应的iframe
            self.returnurl = 'uploadcallback_' + self.uuid;//iframe里回调的路径

            self.createCallback();
            self.createHiddenField();
            self.createIframe();
            self.readyForm();

            //为文件域添加属性 uploader
            self.fileField.uploader = self;
            self.fileField.setAttribute('name', 'file');

        },
        //触发上传
        submit: function () {
            var self = this,
                form = self.form,
                fileField = self.fileField,
                filePath = fileField.value,
                fileList = fileField.files || [], file = fileList[0],
                returnurl = self.returnurl;

            //判断文件是否为空
            if (!filePath) {
                return;
            }
            //解析文件信息
            self.file = self.parseFile(filePath);

            //验证文件是否合法
            if (!self.validate(file)) {
                return;
            }
            //上传前处理函数
            self.beforeStart && self.beforeStart(self.file);

            //获取上传条件参数
            http.get(self.getPath(), self.getParams(file), function (result) {
                var f =  result.key.replace(/\$\{filename\}/g,result.filename);
                self.form.key.value = f;
                self['x-oss-object-acl'].value = 'public-read-write';
                self['OSSAccessKeyId'].value = result.Credentials.AccessKeyId;
                self['x-oss-security-token'].value = result.Credentials.SecurityToken;
                self['callback'].value = result['x-oss-callback-var'];

                self.signature.value = result.Signature;//必要的签名
                self.policy.value = result.Policy;//必要的策略
                //self.domain = 'http://' + data.domain;//文件存储的域名
                form.setAttribute('action', 'http://igr-assettest.oss-cn-hangzhou.aliyuncs.com');//设置form上传action
                form.submit();

            });

        },
        //验证文件 需浏览器支持HTML5 ......待完成 todo:
        validate: function (file) {

            var rules = this.rules, fileType = this.fileType, extList = [];

            //假如不支持HTML5则直接返回
            if (!file) {
                return true;
            }

            if (isInArray(fileType, ['image', 'photo', 'avatar'])) {
                //extList = [];
            }
            return true;
        },
        getPath: function () {
            var self = this, type = self.fileType || 'image';

            //return 'http://' + location.host + uploadForm[type];
            return 'http://192.168.1.252:12834/1.1b/file/upload/oss/callback_1'
        },
        getParams: function (file) {
            var self = this, type = self.fileType || 'image', returnurl = self.returnurl, params = {};

            params = { callback_name: returnurl, filename: file.name ,filesize: file.size };

            if (type == 'image') {
                params.imagetype = 'image'
            } else if (type == 'attachment' || type == 'asset') {
                params.assettype = self.assettype || 'yo.work';

            }

            return params;
        },
        emptyFileField: function () {
            var self = this;

            self.fileField.value = '';
        },
        //每个文件域 对应的回调
        createCallback: function () {
            var self = this, uuid = self.uuid;
            window['uploadcallback_' + uuid] = function (result) {
                var error;
                if (result.code == 200) {
                    // result.url = self.domain + result.url;
                    // self.emptyFileField();
                    self.success && self.success(result);
                } else {
                    error = self.parseError(result);
                    self.fail && self.fail(error);
                }


            };
        },
        createHiddenField: function () {
            /* 此处先判断form里有没有表单域，没有再添加的原因是，有些人使用组件时不够规范，在input的change函数中初始化uploader，*/
            /* 导致初始化过程被加载多次，所以需要加这个判断*/
            var self = this, form = self.form;

            makeInput('key')
            makeInput('x-oss-object-acl')
            makeInput('OSSAccessKeyId')
            makeInput('x-oss-security-token')
            makeInput('callback')
            makeInput('signature')
            makeInput('policy')

            function makeInput(name){
                var field = isExist(name);
                if(!field){
                    self[name] = document.createElement('input');
                    self[name].type = 'hidden';
                    self[name].name = name;
                    $(self[name]).insertBefore(self.fileField);
                }else {
                    self[name]  = field;
                }
            }


            function isExist(name) {
                var el;
                for (var i = 0; i < form.length; i++) {
                    el = form[i];
                    if (el.name == name) {
                        return el;
                    }
                };

                return false;
            }


        },
        createIframe: function () {
            var self = this,
                iframe, iframeName = self.iframeName;


            if (!uploadIframe) {
                iframe = document.createElement('iframe');
                iframe.className = 'uploader-iframe';
                iframe.name = iframe.id = iframeName;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                iframe.onload = function(){
                    var doc = window.frames[iframeName].document;
                    var val = doc.getElementsByTagName('pre')[0].innerHTML;
                    var obj = JSON.parse(val);
                    var callback = obj.data.callback_name;
                    parent[callback]({url: obj.data.url,code: 200 }, 119598);
                }
                uploadIframe = iframe;
            }

        },
        readyForm: function () {
            var self = this;

            self.form.encoding = 'multipart/form-data';//IE6,7
            self.form.setAttribute('enctype', 'multipart/form-data');
            self.form.setAttribute('method', 'post');
            self.form.setAttribute('target', self.iframeName);
        },
        //解析错误信息
        parseError: function (error) {
            var error = error || {}, message = error.message;
            var minwith, maxwidth, minheight, maxheight, minsize, maxsize, result = '';

            error.message = message = message.replace(/\+/g, " ");
            error.message = message = decodeURIComponent(message);

            for (var msg in uploadError) {
                if (msg == message) {
                    error.message = uploadError[msg];
                    break;
                }
            }
            error.message = error.message.replace('Not accept, File type Error (Only Accept', '文件类型不支持，(仅支持:');

            return error;
        },
        //获取文件的信息
        parseFile: function (value) {
            var start, end, name, extension, file;

            start = value.lastIndexOf('\\');
            end = value.lastIndexOf('.');
            if (start > -1) {
                name = value.substring(start + 1, end);
            } else {
                name = value.substring(0, end);
            }
            extension = value.split('.')[1];

            file = {
                value: value,
                name: name,
                path: value,
                extension: extension
            };

            return file;

        },
        fail: function (error) {
            var message = error.message;

            alert(message);
        },
        changeFileType: function (fileType) {
            if (isInArray(fileType, fileTypeList)) {
                this.fileType = fileType;
            } else {
                alert('文件类型有误', fileTypeList.toString());
            }
        }

    };

    Uploader.prototype.init.prototype = Uploader.prototype;

    window.Uploader = Uploader;

})();