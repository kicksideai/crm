.PHONY: build check-deps lockrefresh test
# Every CRM surface lives in ui/src and builds with the standard Wippy Vue
# toolchain into the checked-in static package artifacts.
build:
	cd ui && npm ci --no-audit --no-fund && npm run build
check-deps:
	./scripts/check_dependency_versions.sh
	! grep -q '^version:' wippy.yaml || { echo 'wippy.yaml must not pin a release version; Hub selects the next version'; exit 1; }
test:
	cd test && bash ./run.sh $(WIPPY_TEST_ARGS)
lockrefresh:
	cd test && ./prepare.sh && wippy update $(WIPPY_UPDATE_ARGS)
