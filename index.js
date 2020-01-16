// requires
const fs = require('fs')
const path = require('path')
const sizeOf = require('image-size')
const PptxGenJS = require('pptxgenjs')

// constants
const ICON_ROOT = 'node_modules/@fortawesome/fontawesome-free/svgs/'
const ICON_TYPES = ['brands','regular','solid']
const SLIDE_LAYOUT = 'LAYOUT_WIDE'
const SLIDE_BG = '232c40'
const SLIDE_FG = 'ffffff'
const MAX_ROWS = 5
const MAX_COLUMNS = 13
const START_LEFT = 0.5
const START_TOP = 1
const STEP_HORIZ = 1
const STEP_VERT = 1.2
const SIZE_W = 0.5
const SIZE_H = 0.5
const LABEL_MARGIN = 0.1
const LABEL_FONT_SIZE = 10

// read the filter
var filter = fs.readFileSync('filter.txt').toString().split("\n");

// create the presentation
var pptx = new PptxGenJS()
pptx.layout = SLIDE_LAYOUT

// current slide
var slide = null
var index = 0
var jndex = 0

// iterate on each folder
for (folder of ICON_TYPES) {

	// start a new slide
	slide = null

	// iterate on files
	let full_path =  ICON_ROOT + folder
	fs.readdirSync(full_path).forEach(function(file) {

		// get extension
		var ext = path.extname(file)
		if (ext == '.svg') {

			// filtered?
			var title = path.basename(file, ext)
			//if (filter.includes(title) == false) {
			//	return true
			//}

			// add
			var full_file = full_path + '/' + file
			var dimensions = sizeOf(full_file)
			console.log(file, dimensions.width, dimensions.height)

			// slide
			if (slide == null) {
				slide = pptx.addNewSlide()
				slide.bkgd = SLIDE_BG
				slide.color = SLIDE_FG
				index = 0
				jndex = 0
			}

			// default position
			let def_x = START_LEFT + index * STEP_HORIZ, x = def_x
			let def_y = START_TOP + jndex * STEP_VERT, y = def_y
			let def_w = SIZE_W, w = def_w
			let def_h = SIZE_H, h = def_h

			// check image size
			if (dimensions.width > dimensions.height) {
				h = def_h * dimensions.height / dimensions.width
				y += (def_h - h) / 2
			} else if (dimensions.width < dimensions.height) {
				w = def_w * dimensions.width / dimensions.height
				x += (def_w - w) / 2
			}

			// add fill color
			let contents = fs.readFileSync(full_file, 'utf8')
			contents = contents.replace('<path', '<path fill="#' + SLIDE_FG + '"')
			let buff = new Buffer.from(contents, 'utf8')
			let data = buff.toString('base64')

			// add the image
			slide.addImage({
				data: 'image/svg;base64,' + data,
				x: x, y: y, w: w, h: h, sizing: {
					type: 'contain'
				}
			})
			slide.addText(path.basename(file, ext), {
				x: def_x - STEP_HORIZ / 4,
				y: def_y + SIZE_H + LABEL_MARGIN,
				w: def_w + STEP_HORIZ / 2,
				h: STEP_VERT - LABEL_MARGIN - SIZE_H,
				align: 'center',
				valign: 'top',
				fontSize: LABEL_FONT_SIZE
			})

			// increment
			if (++index == MAX_COLUMNS) {
				index = 0
				if (++jndex == MAX_ROWS) {
					slide = null
				}
			}

		}
	})

}

// save
pptx.writeFile('ppt-fa')
