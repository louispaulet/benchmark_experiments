SITE_DIR := Repetitive Sums - Part2 - 2026/site
PYTEST_TARGET := Repetitive Sums - Part2 - 2026/tests
PORT ?= 5174

.PHONY: up build test deploy

up:
	cd "$(SITE_DIR)" && npm install && npm run dev -- --port $(PORT)

build:
	cd "$(SITE_DIR)" && npm install && npm run build

test:
	python3 -m pytest "$(PYTEST_TARGET)" -q
	cd "$(SITE_DIR)" && npm install && npm test

deploy:
	cd "$(SITE_DIR)" && npm install && npm run deploy
