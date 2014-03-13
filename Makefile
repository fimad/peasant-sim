# A simple make file for 7DRL
#
# This make file depends on two environment variables for locating the Closure
# installation. The first is ${CLOSURE_ROOT} which should point to the base of
# the closure library. The base of the closure library contains both a closure/
# and a third_party/ folder.
#
# The second required environment variable is ${CLOSURE_COMPILER} which points
# to a copy of Closure's compiler.jar file.

NAMESPACE=rl

SRC_DIR=src
OUT_DIR=build
GEN_DIR=gen
THIRD_PARTY=third_party
CSS_DIR=${SRC_DIR}/css
HTML_DIR=${SRC_DIR}/html
JS_DIR=${SRC_DIR}/js
EXTERN_DIR=externs/

SRCS_JS=${JS_DIR}/*.js
SRCS_CSS=${CSS_DIR}/*.less

EXTERNS_FLAGS=`echo ${EXTERN_DIR}/*.js | sed -r 's/(^| )/\1--compiler_flags=--externs=/g'`

DEPLOY_JS=${GEN_DIR}/deploy.js
DEPLOY_CSS=${GEN_DIR}/styles.css

CLOSURE_BUILDER=python ${CLOSURE_ROOT}/closure/bin/build/closurebuilder.py

# If the ${DEBUG} environment variable is set, then build in script mode.
# Otherwise, build in optimized mode.
COMPILE_MODE=`if [ "${DEBUG}" ]; then echo 'script'; else echo 'compiled'; fi`

deploy : ${OUT_DIR}

# Generates a directory structure in ${OUT_DIR} that can be deployed to the HTTP
# server that hosts the App.
${OUT_DIR} : ${DEPLOY_JS} ${DEPLOY_CSS} ${SRCS_HTML}
	mkdir -p ${OUT_DIR}
	cp ${DEPLOY_JS} ${OUT_DIR}
	cp ${DEPLOY_CSS} ${OUT_DIR}
	cp -R ${HTML_DIR}/* ${OUT_DIR}
	cp ${THIRD_PARTY}/* ${OUT_DIR}

${DEPLOY_JS} : ${SRCS_JS}
	mkdir -p ${GEN_DIR}
	${CLOSURE_BUILDER} \
					--root=${CLOSURE_ROOT} \
					--root=${JS_DIR} \
					--namespace=${NAMESPACE} \
					--output_mode=${COMPILE_MODE} \
					--compiler_flags=--warning_level=VERBOSE \
					--compiler_flags=--compilation_level=ADVANCED_OPTIMIZATIONS \
					${EXTERNS_FLAGS} \
					--compiler_jar=${CLOSURE_COMPILER} > ${DEPLOY_JS}
#			|| rm ${DEPLOY_JS}

${DEPLOY_CSS} : ${SRCS_CSS}
	mkdir -p ${GEN_DIR}
	lessc -x ${SRCS_CSS} > ${DEPLOY_CSS}

clean-gen :
	rm -Rf ${GEN_DIR}

clean-out :
	rm -Rf ${OUT_DIR}

clean : clean-gen clean-out
