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
package org.filirom1.concoct.haml;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.JavaScriptException;
import org.mozilla.javascript.Scriptable;

import java.io.InputStreamReader;
import java.net.URL;

/**
 * @author Filirom1
 */
public class HamlCompiler {
    private final Scriptable globalScope;

    public HamlCompiler() {
        URL haml = getClass().getClassLoader().getResource("haml.js");
        URL json2 = getClass().getClassLoader().getResource("json2.js");

        Context context = Context.enter();
        try {
            context.setOptimizationLevel(-1); // Without this, Rhino hits a 64K bytecode limit and fails
            globalScope = context.initStandardObjects();
            context.evaluateReader(globalScope, new InputStreamReader(haml.openStream()), "haml", 0, null);
            context.evaluateReader(globalScope, new InputStreamReader(json2.openStream()), "json2", 0, null);
        } catch (Exception e) {
            throw new RuntimeException(e); // This should never happen
        } finally {
            Context.exit();
        }
    }

    /**
     * Compile HAML String into an HTML String
     *
     * @param haml an HAML String to compile
     * @return the HTML converted String
     */
    public String compile(String haml) {
        Context context = Context.enter();
        try {
            Scriptable compileScope = context.newObject(globalScope);
            compileScope.setParentScope(globalScope);
            compileScope.put("hamlSource", compileScope, haml);
            String compiled = (String) context.evaluateString(compileScope, "Haml.optimize(Haml.compile(hamlSource));", "HamlCompiler", 0, null);
            return removeStartingAndEndingQuote(compiled);
        } catch (JavaScriptException e) {
            throw new RuntimeException("Unable to compile " + haml, e);
        } finally {
            Context.exit();
        }
    }

    private String removeStartingAndEndingQuote(String str) {
        if (str.startsWith("\"")) str = str.substring(1, str.length() - 1);
        if (str.endsWith("\"")) str = str.substring(str.length() - 2, str.length() - 1);
        return str;
    }

}