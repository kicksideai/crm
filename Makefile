.PHONY: check-deps
# Every CRM surface lives in ui/src and builds with the standard Wippy Vue
# toolchain into the checked-in static package artifacts.
check-deps:
	./scripts/check_dependency_versions.sh
	! grep -q '^version:' wippy.yaml || { echo 'wippy.yaml must not pin a release version; Hub selects the next version'; exit 1; }
lockrefresh:
	cd test && ./prepare.sh && wippy update $(WIPPY_UPDATE_ARGS)
