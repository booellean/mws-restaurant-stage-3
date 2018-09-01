const del = require('del');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const clean_css = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const dirs = {
  public: 'src/public',
  dest: 'src/prod'
}

const clean = () => del(['prod']);

const build_html = () => {
  return gulp.src([ `${dirs.public}/*html`])
  .pipe(gulp.dest(`${dirs.dest}`));
}

const build_css_source = (source) => {
  return gulp.src([
          `${dirs.public}/css/styles.css`,
          `${dirs.public}/css/${source}.css`,
          `${dirs.public}/css/toast.css`
      ])
      .pipe(clean_css({ sourceMap: true }))
      .pipe(autoprefixer('last 2 version'))
      .pipe(concat(`${source}.min.css`))
      .pipe(gulp.dest(`${dirs.dest}/css`));
}

const build_css_index = () => build_css_source('index');

const build_css_restaurant = () => build_css_source('restaurant');

const build_css = gulp.series(build_css_index, build_css_restaurant);

const build_script = (filename) => {
  return browserify(`${dirs.public}/js/${filename}`)
      .transform('babelify')
      .bundle()
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(`${dirs.dest}/js`));
}

const copy_static = () => {
  return gulp.src([
      `${dirs.public}/img/*`,
      `${dirs.public}/js/service_worker.js`
  ],  {base: dirs.public})
  .pipe(gulp.dest(`${dirs.dest}`));
};

const build_all = gulp.series(clean, build_html, build_css, copy_static);
gulp.task('watch', () => {
    gulp.watch([dirs.src], build_all)
});

gulp.task('default', gulp.series(build_all, 'watch'), () => {
  console.log('Development started');
});