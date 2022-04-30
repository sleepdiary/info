FILES = src/patterns.js src/sleep-chart.js src/event-graph.js src/prediction-spreadsheet.js

CLOSURE_OPTIONS= \
		--generate_exports \
		--export_local_property_definitions \
		--isolation_mode=IIFE \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		--language_in ECMASCRIPT_NEXT \
		--language_out ECMASCRIPT5 \

docs/sleepdiary-info.min.js: src/header.js src/constants.js $(FILES) src/footer.js
	@echo Compiling $@
	@npx google-closure-compiler \
		$(CLOSURE_OPTIONS) \
		--js $^ \
		--create_source_map $@.map --js_output_file $@
	@echo "//# sourceMappingURL="$(@:docs/%=%).map >> $@

build: docs/sleepdiary-info.min.js docs/simulations.html

clean:
	rm -rf README.html sleepdiary-info.min.js*
