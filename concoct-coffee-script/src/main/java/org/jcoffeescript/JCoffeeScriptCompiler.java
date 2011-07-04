/*
 * Copyright 2010 David Yeung
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

package org.jcoffeescript;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.JavaScriptException;
import org.mozilla.javascript.Scriptable;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Collection;
import java.util.Collections;

public class JCoffeeScriptCompiler {

    private final Scriptable globalScope;
    private final Options options;

    public JCoffeeScriptCompiler() {
        this(Collections.<Options.Option>emptyList());
    }

    public JCoffeeScriptCompiler(Collection<Options.Option> options) {
        URL coffeeScript = getClass().getClassLoader().getResource("coffee-script.js");
        try {
            Context context = Context.enter();
            context.setOptimizationLevel(-1); // Without this, Rhino hits a 64K bytecode limit and fails
            globalScope = context.initStandardObjects();
            context.evaluateReader(globalScope, new InputStreamReader(coffeeScript.openStream()), "coffeeScript", 0, null);
        } catch (IOException e) {
            throw new Error(e); // This should never happen
        } finally {
            Context.exit();
        }
        this.options = new Options(options);
    }

    public String compile(String coffeeScriptSource) throws JCoffeeScriptCompileException {
        Context context = Context.enter();
        try {
            Scriptable compileScope = context.newObject(globalScope);
            compileScope.setParentScope(globalScope);
            compileScope.put("coffeeScriptSource", compileScope, coffeeScriptSource);
            String script = String.format("CoffeeScript.compile(coffeeScriptSource, %s);", options.toJavaScript());
            return (String) context.evaluateString(compileScope, script, "JCoffeeScriptCompiler", 0, null);
        } catch (JavaScriptException e) {
            throw new JCoffeeScriptCompileException(e);
        } finally {
            Context.exit();
        }
    }
}
