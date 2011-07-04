/*
 * Copyright 2009-2010 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.filirom1.concoct.less;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.tools.shell.Global;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.net.URL;

/**
 * @author Rostislav Hristov
 * @author Uriah Carpenter
 * @author Filirom1
 */
public class LessCompiler {

    private final Log logger = LogFactory.getLog(getClass());

    private Scriptable scope;

    /* JAVASCRIPT function : compileString (in engine.js) */
    private Function cs;

    /* JAVASCRIPT function : compileFile (in engine.js)   */
    private Function cf;

    public LessCompiler() {
        try {
            logger.debug("Initializing LESS Engine.");
            URL browser = getClass().getClassLoader().getResource("META-INF/browser.js");
            URL less = getClass().getClassLoader().getResource("META-INF/less.js");
            URL engine = getClass().getClassLoader().getResource("META-INF/engine.js");
            Context cx = Context.enter();
            cx.setOptimizationLevel(9);
            Global global = new Global();
            global.init(cx);
            scope = cx.initStandardObjects(global);
            cx.evaluateReader(scope, new InputStreamReader(browser.openConnection().getInputStream()), browser.getFile(), 1, null);
            cx.evaluateReader(scope, new InputStreamReader(less.openConnection().getInputStream()), less.getFile(), 1, null);
            cx.evaluateReader(scope, new InputStreamReader(engine.openConnection().getInputStream()), engine.getFile(), 1, null);
            cs = (Function) scope.get("compileString", scope);
            cf = (Function) scope.get("compileFile", scope);
        } catch (Exception e) {
            throw new RuntimeException("LESS Engine intialization failed.", e);
        } finally {
            Context.exit();
        }
    }

    /**
     * Compile a less String into a CSS String
     *
     * @param input a less String
     * @return a css String
     * @throws LessException if unable to compile
     */
    public String compile(String input) throws LessException {
        try {
            long time = System.currentTimeMillis();
            String result = call(cs, new Object[]{input});
            logger.debug("The compilation of '" + input + "' took " + (System.currentTimeMillis() - time) + " ms.");
            return result;
        } catch (Exception e) {
            throw LessException.parseLessException(e);
        }
    }

    /**
     * Compile a less file given as un URL into a CSS String
     *
     * @param input an URL of a less file
     * @return a CSS String
     * @throws LessException if unable to compile
     */
    public String compile(URL input) throws LessException {
        try {
            long time = System.currentTimeMillis();
            logger.debug("Compiling URL: " + input.getProtocol() + ":" + input.getFile());
            String result = call(cf, new Object[]{input.getProtocol() + ":" + input.getFile(), getClass().getClassLoader()});
            logger.debug("The compilation of '" + input + "' took " + (System.currentTimeMillis() - time) + " ms.");
            return result;
        } catch (Exception e) {
            throw LessException.parseLessException(e);
        }
    }

    /**
     * Compile a less file given into a CSS String
     *
     * @param input a less file
     * @return a CSS String
     * @throws LessException if unable to compile
     */
    public String compile(File input) throws LessException {
        try {
            long time = System.currentTimeMillis();
            logger.debug("Compiling File: " + "file:" + input.getAbsolutePath());
            String result = call(cf, new Object[]{"file:" + input.getAbsolutePath(), getClass().getClassLoader()});
            logger.debug("The compilation of '" + input + "' took " + (System.currentTimeMillis() - time) + " ms.");
            return result;
        } catch (Exception e) {
            throw LessException.parseLessException(e);
        }
    }

    /**
     * Compile a less file given into a CSS String
     *
     * @param input  a less file
     * @param output a css file
     * @throws LessException if unable to compile.
     */
    public void compile(File input, File output) throws LessException {
        try {
            String content = compile(input);
            if (!output.exists()) {
                output.createNewFile();
            }
            BufferedWriter bw = new BufferedWriter(new FileWriter(output));
            bw.write(content);
            bw.close();
        } catch (Exception e) {
            throw LessException.parseLessException(e);
        }
    }

    private synchronized String call(Function fn, Object[] args) {
        return (String) Context.call(null, fn, scope, scope, args);
    }

}