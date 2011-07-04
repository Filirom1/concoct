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

import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

public class RequireJsCompilerTest {

    @Test
    public void testBuild() throws IOException {
        //fixture
        File all = new File(getClass().getClassLoader().getResource("all.js").getFile());

        //execute
        String compiled = new RequireJsCompiler().compile(all);

        //check
        Assert.assertEquals("define(\"lib/b\",[\"require\",\"exports\",\"module\"],function(){alert(\"b\")}),define(\"lib/a\",[\"lib/b\"],function(){alert(\"a\")}),define(\"all\",[\"lib/a\",\"lib/b\"],function(){alert(\"all\")})", compiled);
    }
}
