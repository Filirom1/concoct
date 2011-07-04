/*
* Copyright 2011 Romain Philibert
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
package org.filirom1.concoct.requireJs;

import org.apache.commons.io.FileUtils;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;

public class RequireJsCompiler {
    public static ScriptableObject global;
    public static final URL build = RequireJsCompiler.class.getClassLoader().getResource("build/build.js");

    public RequireJsCompiler() {
        URL require = getClass().getClassLoader().getResource("require.js");
        URL json2 = getClass().getClassLoader().getResource("json2.js");
        URL rhino = getClass().getClassLoader().getResource("adapt/rhino.js");
        Context context = Context.enter();
        try {
            context.setOptimizationLevel(-1); // Without this, Rhino hits a 64K bytecode limit and fails
            global = context.initStandardObjects();
            context.evaluateReader(global, new InputStreamReader(require.openStream()), "require", 0, null);
            context.evaluateReader(global, new InputStreamReader(rhino.openStream()), "rhino", 0, null);
            context.evaluateReader(global, new InputStreamReader(json2.openStream()), "json2", 0, null);
            String boostrap = "require({" +
                    "baseUrl: '" + getClass().getClassLoader().getResource("build/jslib").getFile() + "'" +
                    "});";
            context.evaluateString(global, boostrap, "bootstrap", 0, null);

            String[] names = {"print", "load", "readFile", "warn", "getResourceAsStream"};
            global.defineFunctionProperties(names, IOAdapter.class, ScriptableObject.DONTENUM);


        } catch (Exception e) {
            throw new RuntimeException(e); // This should never happen
        } finally {
            Context.exit();
        }
    }

    /**
     * Compile a requireJs file into an optimized String.
     * Actually only UglifyJS is used.
     * No options avalaible yet.
     *
     * @param in the requireJs file to read.
     * @return an optimized version of requireJs file and all its dependencies.
     * @throws IOException if unable to compile.
     */
    public String compile(File in) throws IOException {
        Context context = Context.enter();
        try {

            Scriptable compileScope = context.newObject(global);
            compileScope.setParentScope(global);

            File out = File.createTempFile("compileRequireJs", in.getName());

            //Add arguments
            Object[] array = {
                    "",  //cwd
                    "", //build.js file path
                    "name=" + in.getName().replaceAll("\\.js", ""),
                    "out=" + out.getAbsolutePath(),
                    "baseUrl=" + in.getParent()
            };
            Scriptable argsObj = context.newArray(compileScope, array);
            global.defineProperty("arguments", argsObj, ScriptableObject.DONTENUM);


            context.evaluateReader(compileScope, new InputStreamReader(build.openStream()), "build", 0, null);
            String optimizedStr = FileUtils.readFileToString(out);
            out.delete();
            return optimizedStr;
        } catch (Exception e) {
            throw new RuntimeException("Unable to compile " + in.getAbsolutePath(), e);
        } finally {
            Context.exit();
        }
    }
}
