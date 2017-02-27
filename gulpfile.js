var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    webserver = require('gulp-webserver'),
    minifyCss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    cssBase64 = require('gulp-css-base64'),
    requirejs = require('requirejs');


gulp.task('build.view', function () {

    return gulp.src('static/assets/views/**')
        .pipe(gulp.dest('public/assets/views/'));

});
gulp.task('build.version2view', function () {

    return gulp.src('static/assets/version2views/**')
        .pipe(gulp.dest('public/assets/version2views/'));

});

gulp.task('build.tpl', function () {

    return gulp.src(['static/assets/js/directive/tpl/**','static/assets/js/version2directive/tpl/**'])
        .pipe(gulp.dest('public/assets/js/directive/tpl/'));

});

gulp.task('build.imagemin', function () {

    return gulp.src('static/assets/img/**')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/img/'));

});

gulp.task('build.img', function () {

    return gulp.src('static/assets/img/**')
        .pipe(gulp.dest('public/assets/img/'));

});

gulp.task('build.css.lib', function () {

    return gulp.src([
        'static/assets/css/bootstrap.min.css',
        'static/assets/css/uniform.default.css',
        'static/assets/js/lib/angular-animate/ng-animation.css',
        'static/assets/js/lib/angular-animate/animate.css',
        'static/assets/js/lib/angular-block-ui/angular-block-ui.min.css'
    ])
        .pipe(concat('bundle.lib.css'))
        .pipe(gulp.dest('public/assets/css/'));

});

gulp.task('build.css.user', function () {

    return gulp.src([
        'static/assets/css/weui.css',
        'static/assets/css/base.css',
        'static/assets/css/index.css'
    ])
        .pipe(concat('bundle.min.css'))
        .pipe(cssBase64({
            maxWeightResource: 1000
        }))
        .pipe(minifyCss({
            advanced: false,
            keepSpecialComments: '*'
        }))
        .pipe(gulp.dest('public/assets/css/'));

});

gulp.task('build.css', ['build.css.lib', 'build.css.user'], function () {

    return gulp.src(["public/assets/css/bundle.lib.css", "public/assets/css/bundle.min.css"])
        .pipe(rev())
        .pipe(gulp.dest('public/assets/css/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('public/assets/css/'));

});

gulp.task('build.requirejs', function () {

    var Q = require("q");
    var deferred = Q.defer();

    var fs = require('fs');
    var dir = fs.readdirSync('static/assets/js/controller');
    var v2dir = fs.readdirSync('static/assets/js/version2controller');
    var controllers = [];
    dir.forEach(function (filename) {
        controllers.push('controller/' + filename.replace('.js', ''));
    });
    v2dir.forEach(function (filename) {
    	console.info(filename);
        controllers.push('version2controller/' + filename.replace('.js', ''));
    });
    
    requirejs.optimize({
        baseUrl: 'static/assets/js',
        dir: 'public/assets/js',
        shim: {
            "angular": {
                "exports": "angular"
            },
            "angular-animate": ["angular"],
            "angular-cookies": ["angular"],
            "angular-uirouter": ["angular"],
            "angular-blockui": ["angular"]
        },
        paths: {
            "sizzle": "lib/sizzle/sizzle.min", // selector of jQuery
            "angular": "lib/angular/angular.min",
            "angular-animate": "lib/angular-animate/angular-animate.min",
            "angular-cookies": "lib/angular-cookies/angular-cookies.min",
            "angular-uirouter": "lib/angular-ui-router/angular-ui-router.min",
            "angular-blockui": "lib/angular-block-ui/angular-block-ui.min",
            "angular-gestures": "lib/angular-gestures/gestures.min",
            "cityData": "lib/cityData.min",
            "hammer": "lib/hammer.min", 
            "app": "app"
        },
        modules: [{
            name: 'index.lib',
            create: true,
            include: ['angular', 'angular-animate', 'angular-cookies', 'angular-uirouter', 'angular-blockui', 'hammer']
        }, {
            name: 'index.bundle',
            create: true,
            include: ['index.main'].concat(controllers),
            exclude: ['angular', 'angular-animate', 'angular-cookies', 'angular-uirouter', 'angular-blockui', 'hammer']
        }],
        keepBuildDir: false,
        removeCombined: true,
        preserveLicenseComments: true,
        optimize: 'none',
        skipDirOptimize: 'none',
        optimizeCss: 'none'
    }, function () {
        deferred.resolve();
        console.info("success");
    }, function (e) {
        deferred.reject();
        console.info(e);
    });
    return deferred.promise;
});

gulp.task('build.js', ['build.requirejs'], function () {

    return gulp.src(['public/assets/js/*.js', 'public/assets/js/lib/require/require.min.js'])
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('public/assets/js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('public/assets/js/'));

});


gulp.task('build.html', function () {
    return gulp.src(['static/jianbie.html','static/jinrong.html','static/favicon.ico','static/RegInfo.html']).pipe(gulp.dest('public/'));

});
gulp.task('build.index', ['build.js', 'build.css', 'build.html'], function () {
    return gulp.src(['public/assets/js/*.json', 'public/assets/css/*.json', 'static/main.html'])
        .pipe(revCollector())
        .pipe(rename({
            basename: 'index'
        })).pipe(gulp.dest('public/'));
});

gulp.task('default', ['build.all']);

gulp.task('clean.all', function () {
    return gulp.src('public/*.*', {read: false}).pipe(clean());
});

gulp.task('build.all', ['clean.all'], function () {
    gulp.start(['build.index', 'build.img', 'build.view', 'build.version2view','build.tpl']);
});

gulp.task('watch', function () {
    gulp.watch(['static/assets/js/**'], ['build.index']);
    gulp.watch(['static/assets/css/*.css'], ['build.index']);
    gulp.watch(['static/assets/img/**'], ['build.img']);
    gulp.watch(['static/assets/views/**'], ['build.view']);
    gulp.watch(['static/assets/version2views/**'], ['build.version2view']);
    gulp.watch(['static/assets/js/directive/tpl/**','static/assets/js/version2directive/tpl/**'], ['build.tpl']);
});

gulp.task('webserver', function () {
     var host = 'http://127.0.0.1:8080';
//    var host = 'http://106.75.18.162';
    gulp.src('./public/').pipe(webserver({
        host: '0.0.0.0',
        port: 8086,
        open: "http://127.0.0.1:8086/index.html#/index/navi/mall",
        proxies: [
            {source: '/mall', target: host + '/mall'},
            {source: '/user', target: host + '/user'},
            {source: '/notice', target: host + '/notice'},
            {source: '/error', target: host + '/error'},
            {source: '/code', target: host + '/code'},
            {source: '/checkSecCode', target: host + '/checkSecCode'},
            {source: '/message', target: host + '/message'},
            {source: '/userLogin', target: host + '/userLogin'},
            {source: '/checkLogin', target: host + '/checkLogin'},
            {source: '/file', target: host + '/file'},
            {source: '/discoverArticleHtml', target: host + '/discoverArticleHtml'},
            {source: '/discover', target: host + '/discover'},
            {source: '/noticeHtml', target: host + '/noticeHtml'}
        ]
    }));
});

gulp.task('devserver', function () {
    // var host = 'http://127.0.0.1:8080';
    var host = 'http://123.59.81.247:8480';
    gulp.src('./static/').pipe(webserver({
        host: '0.0.0.0',
        port: 9080,
        open: "http://127.0.0.1:9080/index.html#/navi/home",
        proxies: [
            {source: '/mall', target: host + '/mall'},
            {source: '/user', target: host + '/user'},
            {source: '/notice', target: host + '/notice'},
            {source: '/error', target: host + '/error'},
            {source: '/code', target: host + '/code'},
            {source: '/checkSecCode', target: host + '/checkSecCode'},
            {source: '/message', target: host + '/message'},
            {source: '/userLogin', target: host + '/userLogin'},
            {source: '/checkLogin', target: host + '/checkLogin'},
            {source: '/file', target: host + '/file'},
            {source: '/discoverArticleHtml', target: host + '/discoverArticleHtml'},
            {source: '/noticeHtml', target: host + '/noticeHtml'},
            {source: '/user/order', target: host + '/use/order'},
            {source: '/discoverArticleList', target: host + '/discoverArticleList'},
            {source: '/discover', target: host + '/discover'},
            {source: '/discoverArticleHtml', target: host + '/discoverArticleHtml'},
            {source: '/National', target: host + '/National'},


        ]
    }));
});

gulp.task('devserver.v2', function () {
    // var host = 'http://127.0.0.1:8080';
    var host = 'http://123.59.81.247:8480';
    gulp.src('./static/').pipe(webserver({
        host: '0.0.0.0',
        port: 9080,
        open: "http://127.0.0.1:9080/index.html#/navi/home",
        proxies: [
            {source: '/version2mall', target: host + '/version2mall'},
            {source: '/user', target: host + '/user'},
            {source: '/version2notice', target: host + '/version2notice'},
            {source: '/version2error', target: host + '/version2error'},
            {source: '/version2code', target: host + '/version2code'},
            {source: '/version2checkSecCode', target: host + '/version2checkSecCode'},
            {source: '/message', target: host + '/message'},
            {source: '/userLogin', target: host + '/userLogin'},
            {source: '/checkLogin', target: host + '/checkLogin'},
            {source: '/version2file', target: host + '/version2file'},
            {source: '/version2discoverArticleHtml', target: host + '/version2discoverArticleHtml'},
            {source: '/version2noticeHtml', target: host + '/version2noticeHtml'},
            {source: '/version2user/order', target: host + '/version2user/order'},
            {source: '/version2discoverArticleList', target: host + '/version2discoverArticleList'},
            {source: '/version2discoverArticleHtml', target: host + '/version2discoverArticleHtml'},
            {source: '/version2National', target: host + '/version2National'},

            {source: '/queryNewDiscoveryItems', target: host + '/queryNewDiscoveryItems'},
            {source: '/queryUserNotices', target: host + '/queryUserNotices'},
            {source: '/queryInternalArticle', target: host + '/queryInternalArticle'},
            {source: '/version2user/wallet/couponList', target: host + '/version2user/wallet/couponList'},
            {source: '/version2user/wallet/couponProduct', target: host + '/version2user/wallet/couponProduct'},
            {source: '/Version2user/addr', target: host + '/Version2user/addr'},
            {source: '/version2user/wallet/queryGiftProducts', target: host + '/version2user/wallet/queryGiftProducts'}
            
             
        ]
    }));
});
